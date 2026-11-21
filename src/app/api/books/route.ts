import { getApiUser, isApiError, serverError } from "@/lib/api-auth";
import { uploadBookPdfToBackend } from "@/lib/backend-pdf";
import { createBook, deleteBook, getBook, getBooks } from "@/services/book.service";
import { bookSchema } from "@/lib/validations/book.schema";
import { parseBookPdfUpload } from "@/services/book-pdf.service";
import type { Book } from "@/types/book";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const books = await getBooks({
      category: url.searchParams.get("category") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
    });

    return Response.json({ books });
  } catch (error) {
    return serverError("Failed to load books.", error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getApiUser(request);
    if (isApiError(auth)) {
      return auth.error;
    }

    let body: unknown;
    let pdfValue: FormDataEntryValue | null = null;
    try {
      if (
        request.headers
          .get("content-type")
          ?.toLowerCase()
          .includes("multipart/form-data")
      ) {
        const formData = await request.formData();
        body = {
          title: formData.get("title"),
          author: formData.get("author"),
          category: formData.get("category"),
          description: formData.get("description"),
          image: formData.get("image"),
          totalCopies: formData.get("totalCopies"),
        };
        pdfValue = formData.get("pdf");
      } else {
        body = await request.json();
      }
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof TypeError) {
        return Response.json({ message: "Invalid request body." }, { status: 400 });
      }
      throw error;
    }

    const parsed = bookSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid book details." },
        { status: 400 },
      );
    }

    const pdfResult = await parseBookPdfUpload(pdfValue);
    if (pdfResult.error) {
      return Response.json({ message: pdfResult.error }, { status: 400 });
    }

    let book: Book | undefined;
    try {
      book = await createBook(parsed.data, auth.user.id);
      if (pdfResult.pdf) {
        const upload = await uploadBookPdfToBackend(book.id, auth.user.id, {
          ...pdfResult.pdf,
          type: "application/pdf",
        });
        if (!upload.ok) {
          const rollback = await deleteBook(book.id, auth.user.id);
          if (!rollback.deleted) {
            console.error("Could not roll back book after PDF upload failure.", {
              bookId: book.id,
            });
          }
          return Response.json(
            { message: upload.message },
            { status: upload.status },
          );
        }
        book = (await getBook(book.id)) ?? book;
      }
      return Response.json({ book }, { status: 201 });
    } catch (error) {
      if (book) {
        try {
          const rollback = await deleteBook(book.id, auth.user.id);
          if (!rollback.deleted) {
            console.error("Could not roll back book after failed creation.", {
              bookId: book.id,
            });
          }
        } catch (cleanupError) {
          console.error("Could not roll back book after failed creation.", {
            bookId: book.id,
            cleanupError,
          });
        }
      }
      return serverError("Failed to add book.", error);
    }
  } catch (error) {
    return serverError("Failed to add book.", error);
  }
}
