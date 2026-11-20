import "server-only";

import { APIError, betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { getMongoDb } from "@/lib/mongodb";

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET must be set to enable authentication.");
  }

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: mongodbAdapter(getMongoDb()),
    secret,
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      minPasswordLength: 6,
    },
    socialProviders:
      googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {},
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (context.path !== "/sign-up/email") {
          return;
        }

        const password = context.body.password;
        if (typeof password !== "string") {
          return;
        }

        if (password.length < 6) {
          throw new APIError("BAD_REQUEST", {
            message: "Password must be at least 6 characters.",
          });
        }
        if (!/[A-Z]/.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message: "Password must include an uppercase letter.",
          });
        }
        if (!/[a-z]/.test(password)) {
          throw new APIError("BAD_REQUEST", {
            message: "Password must include a lowercase letter.",
          });
        }
      }),
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
