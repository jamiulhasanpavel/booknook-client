This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment setup

Copy `.env.example` to `.env.local` and set `BETTER_AUTH_SECRET` to a secure,
random value and `MONGODB_URI` (or `MONGODB_URL`) to your MongoDB connection
string. Set `BETTER_AUTH_URL` to the app's origin when it differs from
`http://localhost:3000`. `MONGODB_DB_NAME` defaults to `booknook_sever1`,
the same database used by the Express backend.

Set `BOOKNOOK_SERVER_URL` to the Express backend origin (defaults to
`http://localhost:8000`). The client sends optional book PDFs to that backend.
Set the same `BETTER_AUTH_SECRET` value in both the client and backend `.env`
files; the Next.js server uses it to issue short-lived, PDF-only service tokens.
Keep this secret server-side and never use a `NEXT_PUBLIC_` prefix.

Authentication routes require `BETTER_AUTH_SECRET` and either
`MONGODB_URI` or `MONGODB_URL`.
To enable Google sign-in, also set `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET`, and add `http://localhost:3000/api/auth/callback/google`
as an authorized redirect URI in Google Cloud. Use the corresponding production
URL when deploying.
Replace the placeholder contact email and social destinations in the footer
with the project's real contact details before release.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
