import { getApiUser, isApiError, serverError } from "@/lib/api-auth";
import { downloadBookPdfFromBackend } from "@/lib/backend-pdf";
import { isValidBookId } from "@/services/book.service";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getApiUser(request);
    if (isApiError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    if (!isValidBookId(id)) {
      return Response.json({ message: "Book not found." }, { status: 404 });
    }

    const backendResponse = await downloadBookPdfFromBackend(id, auth.user.id);
    const headers = new Headers();
    for (const header of [
      "content-type",
      "content-disposition",
      "content-length",
      "cache-control",
      "x-content-type-options",
    ]) {
      const value = backendResponse.headers.get(header);
      if (value) headers.set(header, value);
    }

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers,
    });
  } catch (error) {
    return serverError("Failed to download book PDF.", error);
  }
}
