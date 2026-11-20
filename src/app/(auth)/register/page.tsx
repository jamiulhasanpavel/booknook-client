import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12 sm:px-6">
      <Suspense
        fallback={
          <div
            className="h-[700px] w-full max-w-md animate-pulse rounded-3xl bg-muted"
            aria-label="Loading registration form"
          />
        }
      >
        <RegisterForm />
      </Suspense>
    </main>
  );
}
