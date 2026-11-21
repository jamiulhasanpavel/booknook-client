import "server-only";

import { getAuth } from "@/lib/auth";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
};

export async function getApiUser(request: Request) {
  if (
    !process.env.BETTER_AUTH_SECRET ||
    (!process.env.MONGODB_URI && !process.env.MONGODB_URL)
  ) {
    return {
      error: Response.json(
        { message: "Authentication or MongoDB is not configured." },
        { status: 503 },
      ),
    } as const;
  }

  const session = await getAuth().api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return {
      error: Response.json({ message: "Login is required." }, { status: 401 }),
    } as const;
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    } satisfies ApiUser,
  } as const;
}

export function isApiError(
  result: Awaited<ReturnType<typeof getApiUser>>,
): result is { error: Response } {
  return "error" in result;
}

export function serverError(message: string, error: unknown) {
  console.error(message, error);
  return Response.json({ message }, { status: 500 });
}
