"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { FileText, LoaderCircle, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { bookCategories } from "@/constants/categories";
import {
  bookResponseSchema,
  bookSchema,
  MAX_BOOK_PDF_SIZE,
  type BookFormValues,
} from "@/lib/validations/book.schema";
import type { Book } from "@/types/book";

const emptyValues: BookFormValues = {
  title: "",
  author: "",
  category: "Fiction",
  description: "",
  image: "",
  totalCopies: "1",
};

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive";

function getErrorMessage(body: unknown, fallback: string) {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }
  return fallback;
}

export default function BookForm({
  book,
  onSaved,
}: {
  book?: Book;
  onSaved?: (book: Book) => void;
}) {
  const [values, setValues] = useState<BookFormValues>(
    book
      ? {
          title: book.title,
          author: book.author,
          category: bookCategories.includes(
            book.category as (typeof bookCategories)[number],
          )
            ? (book.category as (typeof bookCategories)[number])
            : "Other",
          description: book.description,
          image: book.image ?? "",
          totalCopies: String(book.totalCopies),
        }
      : emptyValues,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof BookFormValues, string>>
  >({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: keyof BookFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setErrors((current) => ({
        ...current,
        image: "Choose a PNG, JPEG, or WebP image.",
      }));
      return;
    }
    if (file.size > 1_000_000) {
      setErrors((current) => ({
        ...current,
        image: "Image must be 1 MB or smaller.",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("image", reader.result);
      } else {
        toast.error("Could not read the selected image.");
      }
    };
    reader.onerror = () => {
      toast.error("Could not read the selected image.");
    };
    reader.readAsDataURL(file);
  }

  function handlePdfChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setPdfFile(null);
      setPdfError("Choose a PDF file.");
      return;
    }
    if (file.type && !["application/pdf", "application/x-pdf"].includes(file.type)) {
      setPdfFile(null);
      setPdfError("Choose a valid PDF file.");
      return;
    }
    if (file.size === 0) {
      setPdfFile(null);
      setPdfError("The selected PDF is empty.");
      return;
    }
    if (file.size > MAX_BOOK_PDF_SIZE) {
      setPdfFile(null);
      setPdfError("PDF files must be 10 MB or smaller.");
      return;
    }

    setPdfFile(file);
    setPdfError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pdfError) return;

    const result = bookSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BookFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          typeof field === "string" &&
          field in emptyValues &&
          !fieldErrors[field as keyof BookFormValues]
        ) {
          fieldErrors[field as keyof BookFormValues] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);
    try {
      const requestBody = book
        ? JSON.stringify(result.data)
        : (() => {
            const formData = new FormData();
            for (const [field, value] of Object.entries(result.data)) {
              formData.append(field, String(value));
            }
            if (pdfFile) formData.append("pdf", pdfFile);
            return formData;
          })();
      const response = await fetch(book ? `/api/books/${book.id}` : "/api/books", {
        method: book ? "PATCH" : "POST",
        ...(book ? { headers: { "Content-Type": "application/json" } } : {}),
        body: requestBody,
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        toast.error(getErrorMessage(body, "Could not save this book."));
        return;
      }

      const parsed = bookResponseSchema.safeParse(
        typeof body === "object" && body !== null && "book" in body
          ? body.book
          : null,
      );
      if (!parsed.success) {
        toast.error("The server returned an invalid book response.");
        return;
      }

      toast.success(
        book
          ? "Book updated."
          : pdfFile
            ? "Book and PDF added to the shelf."
            : "Book added to the shelf.",
      );
      onSaved?.(parsed.data);
    } catch (error) {
      console.error("Could not save book.", error);
      toast.error("Could not connect to the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="book-title" className="text-sm font-medium">
            Book title
          </label>
          <input
            id="book-title"
            className={inputClass}
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "book-title-error" : undefined}
          />
          {errors.title ? (
            <p id="book-title-error" className="text-xs text-destructive">
              {errors.title}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="book-author" className="text-sm font-medium">
            Author
          </label>
          <input
            id="book-author"
            className={inputClass}
            value={values.author}
            onChange={(event) => updateField("author", event.target.value)}
            aria-invalid={Boolean(errors.author)}
            aria-describedby={errors.author ? "book-author-error" : undefined}
          />
          {errors.author ? (
            <p id="book-author-error" className="text-xs text-destructive">
              {errors.author}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="book-category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="book-category"
          className={inputClass}
          value={values.category}
          onChange={(event) => updateField("category", event.target.value)}
          aria-invalid={Boolean(errors.category)}
          aria-describedby={
            errors.category ? "book-category-error" : undefined
          }
        >
          {bookCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category ? (
          <p id="book-category-error" className="text-xs text-destructive">
            {errors.category}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="book-total-copies" className="text-sm font-medium">
          Total copies
        </label>
        <input
          id="book-total-copies"
          type="number"
          min="1"
          step="1"
          className={inputClass}
          value={values.totalCopies}
          onChange={(event) => updateField("totalCopies", event.target.value)}
          aria-invalid={Boolean(errors.totalCopies)}
          aria-describedby={
            errors.totalCopies ? "book-total-copies-error" : undefined
          }
        />
        {errors.totalCopies ? (
          <p id="book-total-copies-error" className="text-xs text-destructive">
            {errors.totalCopies}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="book-description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="book-description"
          className="min-h-32 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "book-description-error" : undefined
          }
        />
        {errors.description ? (
          <p id="book-description-error" className="text-xs text-destructive">
            {errors.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="book-image" className="text-sm font-medium">
          Cover image
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="book-image"
            className="site-button site-button-outline cursor-pointer"
          >
            <Upload aria-hidden="true" className="size-4" />
            Upload image
          </label>
          <span className="text-xs text-muted-foreground">
            PNG, JPEG, or WebP; up to 1 MB
          </span>
          {values.image ? (
            <button
              type="button"
              onClick={() => updateField("image", "")}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <X aria-hidden="true" className="size-3.5" />
              Remove image
            </button>
          ) : null}
          <input
            id="book-image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={handleImageChange}
          />
        </div>
        {values.image ? (
          <div className="relative mt-3 h-44 w-36 overflow-hidden rounded-xl border bg-muted">
            <Image
              src={values.image}
              alt="Book cover preview"
              fill
              unoptimized
              sizes="144px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="mt-3 flex h-28 items-center justify-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
            No cover selected
          </div>
        )}
        {errors.image ? (
          <p className="text-xs text-destructive">{errors.image}</p>
        ) : null}
        <div className="space-y-1.5">
          <label htmlFor="book-image-url" className="text-xs text-muted-foreground">
            Or paste an image URL
          </label>
          <input
            id="book-image-url"
            type="url"
            className={inputClass}
            value={values.image.startsWith("data:") ? "" : values.image}
            onChange={(event) => updateField("image", event.target.value)}
            placeholder="https://example.com/cover.jpg"
            aria-invalid={Boolean(errors.image)}
          />
        </div>
      </div>

      {!book ? (
        <div className="space-y-2">
          <label htmlFor="book-pdf" className="text-sm font-medium">
            Book PDF (optional)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="book-pdf"
              className="site-button site-button-outline cursor-pointer"
            >
              <FileText aria-hidden="true" className="size-4" />
              Choose PDF
            </label>
            <span className="text-xs text-muted-foreground">
              PDF up to 10 MB. Only upload files you have permission to share;
              you and active borrowers can download it.
            </span>
            <input
              id="book-pdf"
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              onChange={handlePdfChange}
              disabled={isSaving}
            />
            {pdfFile ? (
              <span className="inline-flex items-center gap-2 text-sm">
                <span className="max-w-56 truncate">{pdfFile.name}</span>
                <button
                  type="button"
                  aria-label="Remove selected PDF"
                  onClick={() => {
                    setPdfFile(null);
                    setPdfError(null);
                  }}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </span>
            ) : null}
          </div>
          {pdfError ? (
            <div className="flex flex-wrap items-center gap-3">
              <p role="alert" className="text-xs text-destructive">
                {pdfError}
              </p>
              <button
                type="button"
                onClick={() => setPdfError(null)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Continue without PDF
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="site-button site-button-primary w-full"
      >
        {isSaving ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : null}
        {isSaving ? "Saving..." : book ? "Save changes" : "Add book"}
      </button>
    </form>
  );
}
