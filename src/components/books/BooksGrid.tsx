"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import BookCard from "@/components/books/BookCard";
import PageHeading from "@/components/shared/PageHeading";
import { bookCategories } from "@/constants/categories";
import { bookResponseSchema } from "@/lib/validations/book.schema";
import type { Book } from "@/types/book";
import { z } from "zod";

const booksPerPage = 30;

const booksResponseSchema = z.object({
  books: z.array(bookResponseSchema),
});

export default function BooksGrid() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const totalPages = Math.ceil(books.length / booksPerPage);
  const firstBookIndex = (page - 1) * booksPerPage;
  const visibleBooks = books.slice(firstBookIndex, firstBookIndex + booksPerPage);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (category) query.set("category", category);

    async function loadBooks() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/books?${query}`, {
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof body === "object" &&
              body !== null &&
              "message" in body &&
              typeof body.message === "string"
              ? body.message
              : "Could not load books.",
          );
        }
        const parsed = booksResponseSchema.safeParse(body);
        if (!parsed.success) {
          throw new Error("The server returned an invalid book list.");
        }
        setBooks(parsed.data.books);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("Could not load books.", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load books.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadBooks();
    return () => controller.abort();
  }, [category, search]);

  return (
    <main className="mx-auto min-h-[50vh] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading
        className="mb-8"
        eyebrow="Find your next read"
        title="All Books"
        description="Browse books shared by the BookNook community."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-[1fr_240px]">
        <label className="relative block">
          <span className="sr-only">Search title or author</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search title or author"
            className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <option value="">All categories</option>
            {bookCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <p role="status" className="py-12 text-center text-muted-foreground">
          Loading books...
        </p>
      ) : error ? (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center text-sm text-destructive"
        >
          {error}
        </p>
      ) : books.length ? (
        <>
          <div className="grid auto-rows-fr items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visibleBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {firstBookIndex + 1}-
              {Math.min(firstBookIndex + booksPerPage, books.length)} of{" "}
              {books.length} books
            </p>
            {totalPages > 1 ? (
              <nav
                aria-label="Book pages"
                className="flex items-center justify-between gap-3 sm:justify-end"
              >
                <button
                  type="button"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page === 1}
                  className="site-button site-button-outline min-h-10 px-4"
                >
                  Previous
                </button>
                <span aria-live="polite" className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page === totalPages}
                  className="site-button site-button-outline min-h-10 px-4"
                >
                  Next
                </button>
              </nav>
            ) : null}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center">
          <h2 className="font-semibold">No books found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your search or category filter.
          </p>
        </div>
      )}
    </main>
  );
}
