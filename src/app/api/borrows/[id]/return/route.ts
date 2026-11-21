import { getApiUser, isApiError, serverError } from "@/lib/api-auth";
import {
  isValidBorrowId,
  returnBorrow,
} from "@/services/borrow.service";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getApiUser(request);
    if (isApiError(auth)) {
      return auth.error;
    }

    const { id } = await params;
    if (!isValidBorrowId(id)) {
      return Response.json({ message: "Borrow record not found." }, { status: 404 });
    }

    const result = await returnBorrow(id, auth.user.id);
    if (result.kind === "not-found") {
      return Response.json(
        { message: "Active borrow record not found." },
        { status: 404 },
      );
    }

    return Response.json({ borrow: result.record });
  } catch (error) {
    return serverError("Failed to return book.", error);
  }
}
