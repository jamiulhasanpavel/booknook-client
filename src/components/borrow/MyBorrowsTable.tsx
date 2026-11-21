"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { borrowResponseSchema } from "@/lib/validations/book.schema";
import type { BorrowRecord } from "@/types/book";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function MyBorrowsTable({
  initialBorrows,
  currentUserId,
}: {
  initialBorrows: BorrowRecord[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [borrows, setBorrows] = useState(initialBorrows);
  const [returningId, setReturningId] = useState<string | null>(null);

  async function handleReturn(id: string) {
    setReturningId(id);
    try {
      const response = await fetch(`/api/borrows/${id}/return`, {
        method: "POST",
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof body.message === "string"
            ? body.message
            : "Could not return this book.";
        toast.error(message);
        return;
      }

      const parsed = borrowResponseSchema.safeParse(
        typeof body === "object" && body !== null && "borrow" in body
          ? body.borrow
          : null,
      );
      if (!parsed.success) {
        toast.error("The server returned an invalid borrow response.");
        return;
      }

      setBorrows((current) =>
        current.map((borrow) =>
          borrow.id === id ? parsed.data : borrow,
        ),
      );
      toast.success("Book returned. Thank you!");
      router.refresh();
    } catch (error) {
      console.error("Could not return book.", error);
      toast.error("Could not connect to the server. Please try again.");
    } finally {
      setReturningId(null);
    }
  }

  return borrows.length ? (
    <div className="rounded-2xl border bg-card">
      <Table className="min-w-[820px]">
        <TableHeader>
          <TableRow>
            <TableHead>Book</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Borrowed</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {borrows.map((borrow) => {
            const isBorrower = borrow.borrowerId === currentUserId;
            return (
              <TableRow key={borrow.id}>
                <TableCell className="max-w-56 truncate font-medium">
                  <Link
                    href={`/books/${borrow.bookId}`}
                    className="hover:underline"
                  >
                    {borrow.bookTitle}
                  </Link>
                </TableCell>
                <TableCell>{isBorrower ? "Borrowed by me" : "My book"}</TableCell>
                <TableCell>{formatDate(borrow.borrowedAt)}</TableCell>
                <TableCell>{formatDate(borrow.dueAt)}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      borrow.status === "active"
                        ? "bg-amber-500/10 text-amber-800"
                        : "bg-emerald-600/10 text-emerald-800"
                    }`}
                  >
                    {borrow.status === "active" ? "Active" : "Returned"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {isBorrower && borrow.status === "active" ? (
                    <button
                      type="button"
                      disabled={returningId === borrow.id}
                      onClick={() => handleReturn(borrow.id)}
                      className="site-button site-button-outline"
                    >
                      {returningId === borrow.id ? "Returning..." : "Return book"}
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center">
      <h2 className="font-semibold">No borrow activity yet</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Books you borrow or lend will appear here.
      </p>
    </div>
  );
}
