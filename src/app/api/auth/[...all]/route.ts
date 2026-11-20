import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

function createHandler(method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE") {
  return async (request: Request) => {
    if (!process.env.BETTER_AUTH_SECRET || !process.env.MONGODB_URI) {
      return Response.json(
        {
          message:
            "Authentication is not configured. Set BETTER_AUTH_SECRET and MONGODB_URI.",
        },
        { status: 503 },
      );
    }

    const handlers = toNextJsHandler(getAuth());
    return handlers[method](request);
  };
}

export const GET = createHandler("GET");
export const POST = createHandler("POST");
export const PATCH = createHandler("PATCH");
export const PUT = createHandler("PUT");
export const DELETE = createHandler("DELETE");
