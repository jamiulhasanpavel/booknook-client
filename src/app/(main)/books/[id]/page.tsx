import Image from "next/image";
import { BookOpen } from "lucide-react";
import { connection } from "next/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BorrowButton from "@/components/borrow/BorrowButton";
import PageHeading from "@/components/shared/PageHeading";
import { getAuth } from "@/lib/auth";
import { hasActiveBorrow } from "@/services/borrow.service";
import { getBook } from "@/services/book.service";

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  let isOwner = false;
  let canDownloadPdf = false;
  if (
    process.env.BETTER_AUTH_SECRET &&
    (process.env.MONGODB_URI || process.env.MONGODB_URL)
  ) {
    const session = await getAuth().api.getSession({ headers: await headers() });
    if (session) {
      isOwner = session.user.id === book.ownerId;
      canDownloadPdf =
        isOwner ||
        (Boolean(book.pdf) && (await hasActiveBorrow(id, session.user.id)));
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="grid gap-8 md:grid-cols-[minmax(240px,360px)_1fr] md:gap-12">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border bg-muted shadow-sm">
          {book.image ? (
            <Image
              src={book.image}
              alt={`Cover of ${book.title}`}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              unoptimized
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100 text-amber-900">
              <BookOpen aria-hidden="true" className="size-16" />
              <span className="text-sm font-medium">Cover coming soon</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-start py-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {book.category}
          </span>
          <PageHeading
            className="mt-4"
            title={book.title}
            description={`by ${book.author}`}
          />
          <p className="mt-8 whitespace-pre-wrap text-base leading-7 text-muted-foreground">
            {book.description}
          </p>
          {book.pdf ? (
            <div className="mt-6 rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-medium">{book.pdf.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF · {(book.pdf.size / (1024 * 1024)).toFixed(1)} MB
              </p>
              {canDownloadPdf ? (
                <a
                  href={`/api/books/${book.id}/pdf`}
                  className="site-button site-button-primary mt-3"
                >
                  Download PDF
                </a>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  Only the owner and active borrowers can download this PDF.
                </p>
              )}
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <BorrowButton
              bookId={book.id}
              bookTitle={book.title}
              availableCopies={book.availableCopies}
              isOwner={isOwner}
            />
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                book.availableCopies === 0
                  ? "bg-amber-500/10 text-amber-800"
                  : "bg-emerald-600/10 text-emerald-800"
              }`}
            >
              {book.availableCopies === 0
                ? "Not Available"
                : `${book.availableCopies} of ${book.totalCopies} copies available`}
            </span>
          </div>
        </div>
      </article>
    </main>
  );
}
