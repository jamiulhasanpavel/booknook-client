import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { getMongoDb } from "@/lib/mongodb";

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET must be set to enable authentication.");
  }

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: mongodbAdapter(getMongoDb()),
    secret,
    emailAndPassword: {
      enabled: true,
    },
    plugins: [nextCookies()],
  });
}

type BookNookAuth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as typeof globalThis & {
  bookNookAuth?: BookNookAuth;
};

export function getAuth() {
  globalForAuth.bookNookAuth ??= createAuth();
  return globalForAuth.bookNookAuth;
}
