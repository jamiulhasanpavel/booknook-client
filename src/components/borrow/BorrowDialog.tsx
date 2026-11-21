"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BorrowFormValues } from "@/lib/validations/book.schema";

function getDefaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function BorrowDialog({
  bookId,
  bookTitle,
  open,
  onOpenChange,
}: {
  bookId: string;
  bookTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [dueAt, setDueAt] = useState(getDefaultDueDate);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const request: BorrowFormValues = {
        dueAt: new Date(`${dueAt}T23:59:59.000Z`).toISOString(),
        message,
      };
      const response = await fetch("/api/borrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, ...request }),
      });
      const body: unknown = await response.json();

      if (response.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        );
        return;
      }
      if (!response.ok) {
        const messageText =
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof body.message === "string"
            ? body.message
            : "Could not borrow this book.";
        setError(messageText);
        toast.error(messageText);
        return;
      }

      toast.success("Borrow request confirmed. Enjoy your book!");
      onOpenChange(false);
      router.refresh();
    } catch (submitError) {
      console.error("Could not borrow book.", submitError);
      setError("Could not connect to the server. Please try again.");
      toast.error("Could not connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Borrow this book</DialogTitle>
          <DialogDescription>
            Set a return date for <span className="font-medium">{bookTitle}</span>.
            You can borrow it for up to 30 days.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          <div className="space-y-1.5">
            <label htmlFor="borrow-due-date" className="text-sm font-medium">
              Return by
            </label>
            <input
              id="borrow-due-date"
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              max={(() => {
                const date = new Date();
                date.setDate(date.getDate() + 30);
                return date.toISOString().slice(0, 10);
              })()}
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="borrow-message" className="text-sm font-medium">
              Note to the owner <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="borrow-message"
              maxLength={500}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              placeholder="Add a short note"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="site-button site-button-primary w-full"
          >
            {isSubmitting ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : null}
            {isSubmitting ? "Confirming..." : "Confirm borrow"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
