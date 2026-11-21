"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import type { BookSummary } from "@/types/book";

export default function BookCard({ book }: { book: BookSummary }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {book.image ? (
          <Image
            src={book.image}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100 text-amber-900">
            <BookOpen aria-hidden="true" className="size-10" />
            <span className="text-xs font-medium">Cover coming soon</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {book.category}
        </span>
        <h3 className="line-clamp-2 min-h-14 text-lg font-semibold leading-snug">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">by {book.author}</p>
        <Link
          href={`/books/${encodeURIComponent(book.id)}`}
          className="site-button site-button-outline mt-auto w-fit"
        >
          View Details
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </Link>
      </div>
    </motion.article>
  );
}
