import "server-only";

import { ObjectId } from "mongodb";
import { getMongoClient, getMongoDb } from "@/lib/mongodb";
import type { BookDocument } from "@/services/book.service";
import type { BorrowRecord } from "@/types/book";

type BorrowDocument = {
  _id: ObjectId;
  bookId: ObjectId;
  bookTitle: string;
  bookImage: string | null;
  ownerId: string;
  borrowerId: string;
  status: "active" | "returned";
  borrowedAt: Date;
  dueAt: Date;
  returnedAt: Date | null;
  message: string;
};

type BorrowResult =
  | { kind: "created"; record: BorrowRecord }
  | { kind: "not-found" }
  | { kind: "own-book" }
  | { kind: "already-borrowed" }
  | { kind: "unavailable" };

type ReturnResult =
  | { kind: "returned"; record: BorrowRecord }
  | { kind: "not-found" };

let activeBorrowIndex: Promise<string> | null = null;

async function ensureActiveBorrowIndex() {
  if (!activeBorrowIndex) {
    activeBorrowIndex = getMongoDb()
      .collection<BorrowDocument>("borrows")
      .createIndex(
        { bookId: 1, borrowerId: 1 },
        {
          unique: true,
          partialFilterExpression: { status: "active" },
          name: "unique_active_borrower_book",
        },
      )
      .catch((error: unknown) => {
        activeBorrowIndex = null;
        throw error;
      });
  }
  await activeBorrowIndex;
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function toBorrow(record: BorrowDocument): BorrowRecord {
  return {
    id: record._id.toString(),
    bookId: record.bookId.toString(),
    bookTitle: record.bookTitle,
    bookImage: record.bookImage,
    ownerId: record.ownerId,
    borrowerId: record.borrowerId,
    status: record.status,
    borrowedAt: record.borrowedAt.toISOString(),
    dueAt: record.dueAt.toISOString(),
    returnedAt: record.returnedAt?.toISOString() ?? null,
    message: record.message,
  };
}

export function isValidBorrowId(id: string) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

export async function getBorrowsForUser(userId: string) {
  const records = await getMongoDb()
    .collection<BorrowDocument>("borrows")
    .find({ $or: [{ borrowerId: userId }, { ownerId: userId }] })
    .sort({ borrowedAt: -1, _id: -1 })
    .toArray();

  return records.map(toBorrow);
}

export async function hasActiveBorrow(bookId: string, borrowerId: string) {
  if (!ObjectId.isValid(bookId) || new ObjectId(bookId).toString() !== bookId) {
    return false;
  }

  const record = await getMongoDb()
    .collection<BorrowDocument>("borrows")
    .findOne(
      { bookId: new ObjectId(bookId), borrowerId, status: "active" },
      { projection: { _id: 1 } },
    );

  return Boolean(record);
}

export async function borrowBook(
  bookId: string,
  borrowerId: string,
  dueAt: Date,
  message: string,
): Promise<BorrowResult> {
  if (!ObjectId.isValid(bookId) || new ObjectId(bookId).toString() !== bookId) {
    return { kind: "not-found" } as const;
  }

  await ensureActiveBorrowIndex();
  const db = getMongoDb();
  const books = db.collection<BookDocument>("books");
  const borrows = db.collection<BorrowDocument>("borrows");
  const id = new ObjectId(bookId);
  const session = getMongoClient().startSession();
  let outcome: BorrowResult | undefined;
  try {
    await session.withTransaction(async () => {
      outcome = undefined;
      const book = await books.findOne({ _id: id }, { session });
      if (!book) {
        outcome = { kind: "not-found" };
        return;
      }
      if (book.ownerId === borrowerId) {
        outcome = { kind: "own-book" };
        return;
      }

      const existing = await borrows.findOne(
        { bookId: id, borrowerId, status: "active" },
        { projection: { _id: 1 }, session },
      );
      if (existing) {
        outcome = { kind: "already-borrowed" };
        return;
      }

      const now = new Date();
      const updatedBook = await books.findOneAndUpdate(
        { _id: id, availableCopies: { $gt: 0 } },
        {
          $inc: { availableCopies: -1 },
          $set: { updatedAt: now },
        },
        { returnDocument: "after", session },
      );
      if (!updatedBook) {
        outcome = { kind: "unavailable" };
        return;
      }

      const document: BorrowDocument = {
        _id: new ObjectId(),
        bookId: id,
        bookTitle: book.title,
        bookImage: book.image ?? null,
        ownerId: book.ownerId ?? "",
        borrowerId,
        status: "active",
        borrowedAt: now,
        dueAt,
        returnedAt: null,
        message,
      };

      await borrows.insertOne(document, { session });
      await books.updateOne(
        { _id: id, availableCopies: updatedBook.availableCopies },
        { $set: { isBorrowed: updatedBook.availableCopies === 0 } },
        { session },
      );
      outcome = { kind: "created", record: toBorrow(document) };
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { kind: "already-borrowed" };
    }
    throw error;
  } finally {
    await session.endSession();
  }

  if (!outcome) {
    throw new Error("Borrow transaction completed without a result.");
  }
  return outcome;
}

export async function returnBorrow(
  borrowId: string,
  userId: string,
): Promise<ReturnResult> {
  if (!isValidBorrowId(borrowId)) {
    return { kind: "not-found" } as const;
  }

  const db = getMongoDb();
  const books = db.collection<BookDocument>("books");
  const borrows = db.collection<BorrowDocument>("borrows");
  const session = getMongoClient().startSession();
  const now = new Date();
  let outcome: ReturnResult | undefined;

  try {
    await session.withTransaction(async () => {
      outcome = undefined;
      const record = await borrows.findOneAndUpdate(
        {
          _id: new ObjectId(borrowId),
          borrowerId: userId,
          status: "active",
        },
        { $set: { status: "returned", returnedAt: now } },
        { returnDocument: "after", session },
      );

      if (!record) {
        outcome = { kind: "not-found" };
        return;
      }

      const updatedBook = await books.findOneAndUpdate(
        {
          _id: record.bookId,
          $expr: { $lt: ["$availableCopies", "$totalCopies"] },
        },
        {
          $inc: { availableCopies: 1 },
          $set: { updatedAt: now },
        },
        { returnDocument: "after", session },
      );

      if (!updatedBook) {
        throw new Error("Could not restore a book copy after return.");
      }

      await books.updateOne(
        { _id: record.bookId, availableCopies: updatedBook.availableCopies },
        { $set: { isBorrowed: updatedBook.availableCopies === 0 } },
        { session },
      );
      outcome = { kind: "returned", record: toBorrow(record) };
    });
  } finally {
    await session.endSession();
  }

  if (!outcome) {
    throw new Error("Return transaction completed without a result.");
  }
  return outcome;
}
