import { getApiUser, isApiError, serverError } from "@/lib/api-auth";
import { bookSchema } from "@/lib/validations/book.schema";
import {
  deleteBook,
  getBook,
  isValidBookId,
  updateBook,
} from "@/services/book.service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const book = await getBook(id);

    if (!book) {
      return Response.json({ message: "Book not found." }, { status: 404 });
    }
    return Response.json({ book });
  } catch (error) {
    return serverError("Failed to load book.", error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await getApiUser(request);
    if (isApiError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    if (!isValidBookId(id)) {
      return Response.json({ message: "Book not found." }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = bookSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid book details." },
        { status: 400 },
      );
    }

    const result = await updateBook(id, auth.user.id, parsed.data);
    if (result.kind === "not-found") {
      return Response.json(
        { message: "Book not found or you do not own it." },
        { status: 404 },
      );
    }
    if (result.kind === "copies-in-use") {
      return Response.json(
        {
          message: `At least ${result.borrowedCopies} copies are currently borrowed.`,
        },
        { status: 409 },
      );
    }
    if (result.kind === "conflict") {
      return Response.json(
        { message: "This book changed while you were editing. Refresh and try again." },
        { status: 409 },
      );
    }
    return Response.json({ book: result.book });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ message: "Invalid request body." }, { status: 400 });
    }
    return serverError("Failed to update book.", error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await getApiUser(request);
    if (isApiError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    const result = await deleteBook(id, auth.user.id);
    if (result.borrowed) {
      return Response.json(
        { message: "Return this book before deleting it." },
        { status: 409 },
      );
    }
    if (!result.deleted) {
      return Response.json(
        { message: "Book not found or you do not own it." },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      ...(result.cleanupFailed
        ? { warning: "Book deleted, but its PDF could not be removed." }
        : {}),
    });
  } catch (error) {
    return serverError("Failed to delete book.", error);
  }
}
