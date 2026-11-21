import "server-only";

import { ObjectId, type Filter } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";
import { deleteBookPdf } from "@/services/book-pdf.service";
import type { Book, BookSummary } from "@/types/book";

export type BookDocument = {
  _id: ObjectId;
  title: string;
  author: string;
  category: string;
  description?: string;
  image?: string | null;
  ownerId?: string;
  totalCopies?: number;
  availableCopies?: number;
  isBorrowed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  pdfFileId?: ObjectId;
  pdfName?: string;
  pdfSize?: number;
};

function toBook(book: BookDocument): Book {
  const createdAt = book.createdAt ?? new Date(0);
  const totalCopies = book.totalCopies ?? Math.max(1, book.availableCopies ?? 1);
  const availableCopies = Math.max(
    0,
    Math.min(
      totalCopies,
      book.availableCopies ?? (book.isBorrowed ? 0 : totalCopies),
    ),
  );

  return {
    id: book._id.toString(),
    title: book.title,
    author: book.author,
    category: book.category,
    description: book.description ?? "Description not provided.",
    image: book.image ?? null,
    ownerId: book.ownerId ?? "",
    totalCopies,
    availableCopies,
    isBorrowed: availableCopies === 0,
    createdAt: createdAt.toISOString(),
    updatedAt: (book.updatedAt ?? createdAt).toISOString(),
    pdf:
      book.pdfFileId && book.pdfName && typeof book.pdfSize === "number"
        ? { name: book.pdfName, size: book.pdfSize }
        : null,
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isValidBookId(id: string) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

export async function getLatestBooks(): Promise<BookSummary[]> {
  const books = await getMongoDb()
    .collection<BookDocument>("books")
    .find(
      {},
      {
        projection: {
          title: 1,
          author: 1,
          category: 1,
          image: 1,
          createdAt: 1,
        },
      },
    )
    .sort({ createdAt: -1, _id: -1 })
    .limit(6)
    .toArray();

  return books.map((book) => ({
    id: book._id.toString(),
    title: book.title,
    author: book.author,
    category: book.category,
    image: book.image ?? null,
  }));
}

export async function getBooks(filters: {
  category?: string;
  search?: string;
} = {}): Promise<Book[]> {
  const query: Filter<BookDocument> = {};

  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.search?.trim()) {
    const search = escapeRegex(filters.search.trim());
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
    ];
  }

  const books = await getMongoDb()
    .collection<BookDocument>("books")
    .find(query)
    .sort({ createdAt: -1, _id: -1 })
    .toArray();

  return books.map(toBook);
}

export async function getBook(id: string) {
  if (!isValidBookId(id)) {
    return null;
  }

  const book = await getMongoDb()
    .collection<BookDocument>("books")
    .findOne({ _id: new ObjectId(id) });

  return book ? toBook(book) : null;
}

export async function getBooksByOwner(ownerId: string) {
  const books = await getMongoDb()
    .collection<BookDocument>("books")
    .find({ ownerId })
    .sort({ createdAt: -1, _id: -1 })
    .toArray();

  return books.map(toBook);
}

type BookInput = Omit<
  Book,
  | "id"
  | "ownerId"
  | "availableCopies"
  | "isBorrowed"
  | "createdAt"
  | "updatedAt"
  | "pdf"
>;

export async function createBook(
  input: BookInput,
  ownerId: string,
) {
  const now = new Date();
  const document = {
    _id: new ObjectId(),
    ...input,
    ownerId,
    availableCopies: input.totalCopies,
    isBorrowed: false,
    createdAt: now,
    updatedAt: now,
  };
  const result = await getMongoDb()
    .collection<BookDocument>("books")
    .insertOne(document);

  return toBook({ ...document, _id: result.insertedId });
}

export type UpdateBookResult =
  | { kind: "updated"; book: Book }
  | { kind: "not-found" }
  | { kind: "copies-in-use"; borrowedCopies: number }
  | { kind: "conflict" };

export async function updateBook(
  id: string,
  ownerId: string,
  input: BookInput,
): Promise<UpdateBookResult> {
  if (!isValidBookId(id)) {
    return { kind: "not-found" };
  }

  const books = getMongoDb().collection<BookDocument>("books");
  const _id = new ObjectId(id);
  const existing = await books.findOne({ _id, ownerId });
  if (!existing) {
    return { kind: "not-found" };
  }

  const totalCopies = existing.totalCopies ?? Math.max(1, existing.availableCopies ?? 1);
  const availableCopies =
    existing.availableCopies ?? (existing.isBorrowed ? 0 : totalCopies);
  const borrowedCopies = Math.max(0, totalCopies - availableCopies);
  if (input.totalCopies < borrowedCopies) {
    return { kind: "copies-in-use", borrowedCopies };
  }

  const filter: Filter<BookDocument> = { _id, ownerId };
  filter.totalCopies =
    existing.totalCopies === undefined
      ? { $exists: false }
      : existing.totalCopies;
  filter.availableCopies =
    existing.availableCopies === undefined
      ? { $exists: false }
      : existing.availableCopies;
  const newAvailableCopies = input.totalCopies - borrowedCopies;
  const result = await books.updateOne(filter, {
    $set: {
      ...input,
      availableCopies: newAvailableCopies,
      isBorrowed: newAvailableCopies === 0,
      updatedAt: new Date(),
    },
  });

  if (result.modifiedCount !== 1) {
    return { kind: "conflict" };
  }

  const updated = await books.findOne({ _id });
  if (!updated) {
    throw new Error("Updated book could not be reloaded.");
  }
  return { kind: "updated", book: toBook(updated) };
}

export async function deleteBook(id: string, ownerId: string) {
  if (!isValidBookId(id)) {
    return { deleted: false, borrowed: false, cleanupFailed: false };
  }

  const books = getMongoDb().collection<BookDocument>("books");
  const _id = new ObjectId(id);
  const book = await books.findOne({ _id, ownerId });
  if (!book) {
    return { deleted: false, borrowed: false, cleanupFailed: false };
  }

  const totalCopies = book.totalCopies ?? Math.max(1, book.availableCopies ?? 1);
  const availableCopies =
    book.availableCopies ?? (book.isBorrowed ? 0 : totalCopies);
  if (availableCopies < totalCopies) {
    return { deleted: false, borrowed: true, cleanupFailed: false };
  }

  const filter: Filter<BookDocument> = {
    _id,
    ownerId,
    totalCopies,
    availableCopies,
  };
  if (book.totalCopies === undefined) filter.totalCopies = { $exists: false };
  if (book.availableCopies === undefined) {
    filter.availableCopies = { $exists: false };
  }
  const result = await books.deleteOne(filter);

  if (result.deletedCount === 1) {
    if (book?.pdfFileId) {
      try {
        await deleteBookPdf(book.pdfFileId);
      } catch (error) {
        console.error("Could not remove PDF after deleting book.", {
          bookId: id,
          fileId: book.pdfFileId.toString(),
          error,
        });
        return { deleted: true, borrowed: false, cleanupFailed: true };
      }
    }
    return { deleted: true, borrowed: false, cleanupFailed: false };
  }

  const latest = await books.findOne({ _id, ownerId });
  const latestTotal = latest?.totalCopies ?? 1;
  const latestAvailable =
    latest?.availableCopies ?? (latest?.isBorrowed ? 0 : latestTotal);

  return {
    deleted: false,
    borrowed: Boolean(latest && latestAvailable < latestTotal),
    cleanupFailed: false,
  };
}
