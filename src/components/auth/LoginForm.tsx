"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, LoaderCircle } from "lucide-react";
import PageHeading from "@/components/shared/PageHeading";
import { authClient } from "@/lib/auth-client";
import { getSafeReturnTo } from "@/lib/redirects";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "We couldn't log you in. Please check your details and try again.";
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeReturnTo(searchParams.get("callbackUrl"));
  const loginError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(
    loginError === "auth_unavailable"
      ? "Authentication is not configured. Please try again later."
      : loginError
        ? "Google sign-in couldn't be completed. Please try again."
        : null,
  );
  const [notice, setNotice] = useState<string | null>(
    searchParams.get("registered") === "true"
      ? "Your account is ready. Log in to continue."
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const response = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: callbackUrl,
      });

      if (response.error) {
        setFormError(response.error.message ?? "Login failed.");
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setFormError(null);
    setIsGoogleLoading(true);

    try {
      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
        errorCallbackURL: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      });

      if (response.error) {
        setFormError(response.error.message ?? "Google sign-in failed.");
        setIsGoogleLoading(false);
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
      setIsGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    setFormError(null);
    setNotice(null);

    if (!email.trim()) {
      setFormError("Enter your email address first to request a reset link.");
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (response.error) {
        setFormError(
          response.error.message ?? "Password reset couldn't be requested.",
        );
        return;
      }

      setNotice(
        "If an account exists for this email, a password reset link will be sent.",
      );
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsResettingPassword(false);
    }
  }

  const registerHref =
    callbackUrl === "/"
      ? "/register"
      : `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <section className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-7 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen aria-hidden="true" className="size-6" />
        </span>
        <PageHeading
          className="mt-4"
          title="Welcome back"
          description="Log in to continue your reading journey."
        />
      </div>

      {formError ? (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}
      {notice ? (
        <p
          role="status"
          className="mb-5 rounded-xl border border-emerald-700/20 bg-emerald-700/10 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="text-sm font-medium">
              Password
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResettingPassword || isSubmitting || isGoogleLoading}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
            >
              {isResettingPassword ? "Sending reset link..." : "Forgot password?"}
            </button>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading || isResettingPassword}
          className="site-button site-button-primary w-full"
        >
          {isSubmitting ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : null}
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isSubmitting || isResettingPassword}
        className="site-button site-button-outline w-full"
      >
        {isGoogleLoading ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <span aria-hidden="true" className="font-bold text-blue-600">
            G
          </span>
        )}
        {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
      </button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to BookNook?{" "}
        <Link
          href={registerHref}
          className="font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}
