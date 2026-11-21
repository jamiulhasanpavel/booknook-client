"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import BookForm from "@/components/books/BookForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Book } from "@/types/book";

export default function MyBooksTable({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState(initialBooks);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/books/${deleting.id}`, {
        method: "DELETE",
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof body.message === "string"
            ? body.message
            : "Could not delete this book.";
        toast.error(message);
        return;
      }

      setBooks((current) => current.filter((book) => book.id !== deleting.id));
      const cleanupWarning =
        typeof body === "object" &&
        body !== null &&
        "warning" in body &&
        typeof body.warning === "string"
          ? body.warning
          : null;
      if (cleanupWarning) {
        toast.warning(cleanupWarning);
      } else {
        toast.success("Book deleted.");
      }
      setDeleting(null);
    } catch (error) {
      console.error("Could not delete book.", error);
      toast.error("Could not connect to the server. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {books.length ? (
        <div className="rounded-2xl border bg-card">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Copies</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="max-w-56 truncate font-medium">
                    <Link href={`/books/${book.id}`} className="hover:underline">
                      {book.title}
                    </Link>
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.category}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        book.availableCopies === 0
                          ? "bg-amber-500/10 text-amber-800"
                          : "bg-emerald-600/10 text-emerald-800"
                      }`}
                    >
                      {book.availableCopies} / {book.totalCopies} available
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(book)}
                        aria-label={`Edit ${book.title}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg border hover:bg-muted"
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(book)}
                        aria-label={`Delete ${book.title}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg border text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center">
          <h2 className="font-semibold">Your shelf is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first book and share it with the community.
          </p>
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit book</DialogTitle>
            <DialogDescription>Update the details on your shelf.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <BookForm
              key={editing.id}
              book={editing}
              onSaved={(updatedBook) => {
                setBooks((current) =>
                  current.map((item) =>
                    item.id === updatedBook.id ? updatedBook : item,
                  ),
                );
                setEditing(null);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && !isDeleting && setDeleting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this book?</DialogTitle>
            <DialogDescription>
              {deleting
                ? `“${deleting.title}” will be removed from your shelf. This cannot be undone.`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleting(null)}
              className="site-button site-button-outline"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="site-button bg-destructive text-white hover:bg-destructive/85"
            >
              {isDeleting ? "Deleting..." : "Delete book"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
