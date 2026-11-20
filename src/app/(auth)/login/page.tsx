import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12 sm:px-6">
      <Suspense
        fallback={
          <div
            className="h-[620px] w-full max-w-md animate-pulse rounded-3xl bg-muted"
            aria-label="Loading login form"
          />
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
