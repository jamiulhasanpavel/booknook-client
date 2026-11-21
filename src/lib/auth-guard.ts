import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAuth } from "@/lib/auth";
import { getLoginHref } from "@/lib/redirects";

export async function requireUser(returnTo: string) {
  await connection();
  if (
    (!process.env.MONGODB_URI && !process.env.MONGODB_URL) ||
    !process.env.BETTER_AUTH_SECRET
  ) {
    const loginHref = getLoginHref(returnTo);
    redirect(
      `${loginHref}${loginHref.includes("?") ? "&" : "?"}error=auth_unavailable`,
    );
  }

  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect(getLoginHref(returnTo));
  }

  return session.user;
}
