import { getApiUser, isApiError, serverError } from "@/lib/api-auth";
import { borrowSchema } from "@/lib/validations/book.schema";
import {
  borrowBook,
  getBorrowsForUser,
} from "@/services/borrow.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const auth = await getApiUser(request);
    if (isApiError(auth)) {
      return auth.error;
    }

    const records = await getBorrowsForUser(auth.user.id);
    return Response.json({ borrows: records });
  } catch (error) {
    return serverError("Failed to load borrow records.", error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getApiUser(request);
    if (isApiError(auth)) {
      return auth.error;
    }

    const body: unknown = await request.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("bookId" in body) ||
      typeof body.bookId !== "string"
    ) {
      return Response.json({ message: "Choose a valid book." }, { status: 400 });
    }

    const parsed = borrowSchema.safeParse({
      dueAt: "dueAt" in body ? body.dueAt : undefined,
      message: "message" in body ? body.message : "",
    });
    if (!parsed.success) {
      return Response.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid borrow details." },
        { status: 400 },
      );
    }

    const dueAt = new Date(parsed.data.dueAt);
    const now = new Date();
    const maximumDueDate = new Date(now);
    maximumDueDate.setDate(maximumDueDate.getDate() + 30);
    if (dueAt <= now || dueAt > maximumDueDate) {
      return Response.json(
        { message: "Choose a return date within the next 30 days." },
        { status: 400 },
      );
    }

    const result = await borrowBook(
      body.bookId,
      auth.user.id,
      dueAt,
      parsed.data.message,
    );

    if (result.kind === "not-found") {
      return Response.json({ message: "Book not found." }, { status: 404 });
    }
    if (result.kind === "own-book") {
      return Response.json(
        { message: "You cannot borrow your own book." },
        { status: 400 },
      );
    }
    if (result.kind === "already-borrowed") {
      return Response.json(
        { message: "You already have an active borrow for this book." },
        { status: 409 },
      );
    }
    if (result.kind === "unavailable") {
      return Response.json(
        { message: "Not Available." },
        { status: 409 },
      );
    }

    return Response.json({ borrow: result.record }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ message: "Invalid request body." }, { status: 400 });
    }
    return serverError("Failed to borrow book.", error);
  }
}
