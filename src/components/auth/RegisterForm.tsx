"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getSafeReturnTo } from "@/lib/redirects";
import {
  passwordRequirements,
  registrationSchema,
  type RegistrationFormValues,
} from "@/lib/validations/auth.schema";

const initialValues: RegistrationFormValues = {
  name: "",
  email: "",
  image: "",
  password: "",
};

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "We couldn't complete registration. Please try again.";
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeReturnTo(searchParams.get("callbackUrl"));
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  function updateField(field: keyof RegistrationFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const result = registrationSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<
        Record<keyof RegistrationFormValues, string>
      > = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          typeof field === "string" &&
          field in initialValues &&
          !fieldErrors[field as keyof RegistrationFormValues]
        ) {
          fieldErrors[field as keyof RegistrationFormValues] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await authClient.signUp.email({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        image: result.data.image,
      });

      if (response.error) {
        setFormError(response.error.message ?? "Registration failed.");
        return;
      }

      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("registered", "true");
      if (callbackUrl !== "/") {
        loginUrl.searchParams.set("callbackUrl", callbackUrl);
      }
      router.push(`${loginUrl.pathname}${loginUrl.search}`);
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
        callbackURL: "/",
        errorCallbackURL: "/register?error=google",
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

  const password = values.password;
  const hasUppercase = passwordRequirements.uppercase.test(password);
  const hasLowercase = passwordRequirements.lowercase.test(password);
  const hasMinimumLength =
    password.length >= passwordRequirements.minimumLength;

  return (
    <section className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-7 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen aria-hidden="true" className="size-6" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Create your BookNook account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join a community that loves sharing stories.
        </p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label htmlFor="register-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="register-name"
            name="name"
            autoComplete="name"
            required
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "register-name-error" : undefined}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
            placeholder="Your name"
          />
          {errors.name ? (
            <p id="register-name-error" className="text-xs text-destructive">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
            placeholder="you@example.com"
          />
          {errors.email ? (
            <p id="register-email-error" className="text-xs text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-photo" className="text-sm font-medium">
            Photo URL
          </label>
          <input
            id="register-photo"
            name="image"
            type="url"
            autoComplete="url"
            required
            value={values.image}
            onChange={(event) => updateField("image", event.target.value)}
            aria-invalid={Boolean(errors.image)}
            aria-describedby={errors.image ? "register-photo-error" : undefined}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
            placeholder="https://example.com/photo.jpg"
          />
          {errors.image ? (
            <p id="register-photo-error" className="text-xs text-destructive">
              {errors.image}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => updateField("password", event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "register-password-error" : "password-rules"
            }
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
            placeholder="Create a password"
          />
          {errors.password ? (
            <p
              id="register-password-error"
              className="text-xs text-destructive"
            >
              {errors.password}
            </p>
          ) : null}
          <ul
            id="password-rules"
            aria-label="Password requirements"
            className="space-y-1 pt-1 text-xs"
          >
            <li
              className={
                hasMinimumLength ? "text-emerald-700" : "text-muted-foreground"
              }
            >
              {hasMinimumLength ? "✓" : "○"} At least 6 characters
            </li>
            <li
              className={
                hasUppercase ? "text-emerald-700" : "text-muted-foreground"
              }
            >
              {hasUppercase ? "✓" : "○"} One uppercase letter
            </li>
            <li
              className={
                hasLowercase ? "text-emerald-700" : "text-muted-foreground"
              }
            >
              {hasLowercase ? "✓" : "○"} One lowercase letter
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : null}
          {isSubmitting ? "Creating account..." : "Register"}
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
        disabled={isGoogleLoading || isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
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
        Already have an account?{" "}
        <Link
          href={
            callbackUrl === "/"
              ? "/login"
              : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
          }
          className="font-semibold text-primary hover:underline"
        >
          Log in
        </Link>
      </p>
    </section>
  );
}
