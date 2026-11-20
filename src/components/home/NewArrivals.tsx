import Link from "next/link";
import BookCard from "@/components/books/BookCard";
import { getLatestBooks } from "@/services/book.service";
import type { BookSummary } from "@/types/book";

export default async function NewArrivals() {
  let books: BookSummary[] | null = null;

  try {
    books = await getLatestBooks();
  } catch (error) {
    console.error("Failed to load the latest books from MongoDB.", error);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
            Fresh on the shelf
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            New Arrivals
          </h2>
          <p className="mt-2 text-muted-foreground">
            The latest books shared by our reading community.
          </p>
        </div>
      </div>

      {books === null ? (
        <p
          role="alert"
          className="rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground"
        >
          New arrivals are temporarily unavailable. Check the database
          configuration and try again.
        </p>
      ) : books.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center">
          <h3 className="text-lg font-semibold">A fresh shelf is on its way</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            There are no books to show yet. Check back soon or browse the
            collection.
          </p>
        </div>
      )}

      <div className="mt-9 text-center">
        <Link
          href="/books"
          className="inline-flex items-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
        >
          See All Books
        </Link>
      </div>
    </section>
  );
}
