import "server-only";

import { createHmac, hkdfSync, randomUUID } from "node:crypto";

const tokenIssuer = "booknook-client";
const tokenAudience = "booknook-server-pdf";
const tokenKeyInfo = Buffer.from("booknook-pdf-proxy-v1");
const tokenLifetimeSeconds = 60;

function getBackendUrl(bookId: string) {
  const baseUrl = process.env.BOOKNOOK_SERVER_URL?.trim() || "http://localhost:8000";
  return new URL(`/books/${encodeURIComponent(bookId)}/pdf`, baseUrl);
}

function createPdfProxyToken(userId: string) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET must be set for backend PDF access.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: tokenIssuer,
      aud: tokenAudience,
      sub: userId,
      iat: now,
      exp: now + tokenLifetimeSeconds,
      jti: randomUUID(),
    }),
  ).toString("base64url");
  const content = `${header}.${payload}`;
  const key = Buffer.from(
    hkdfSync(
      "sha256",
      Buffer.from(secret),
      Buffer.alloc(0),
      tokenKeyInfo,
      32,
    ),
  );
  const signature = createHmac("sha256", key)
    .update(content)
    .digest("base64url");

  return `${content}.${signature}`;
}

function getAuthorization(userId: string) {
  return `Bearer ${createPdfProxyToken(userId)}`;
}

async function readBackendMessage(response: Response) {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      return body.message;
    }
  } catch {
    return `Backend PDF request failed (${response.status}).`;
  }

  return `Backend PDF request failed (${response.status}).`;
}

export async function uploadBookPdfToBackend(
  bookId: string,
  userId: string,
  pdf: { name: string; type: string; data: Buffer },
) {
  const formData = new FormData();
  formData.append(
    "pdf",
    new Blob([new Uint8Array(pdf.data)], { type: pdf.type || "application/pdf" }),
    pdf.name,
  );

  const response = await fetch(getBackendUrl(bookId), {
    method: "POST",
    headers: { Authorization: getAuthorization(userId) },
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      message: await readBackendMessage(response),
    };
  }

  return { ok: true as const };
}

export async function downloadBookPdfFromBackend(
  bookId: string,
  userId: string,
) {
  return fetch(getBackendUrl(bookId), {
    headers: { Authorization: getAuthorization(userId) },
    cache: "no-store",
  });
}
