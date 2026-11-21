"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getLoginHref } from "@/lib/redirects";
import BorrowDialog from "@/components/borrow/BorrowDialog";

export default function BorrowButton({
  bookId,
  bookTitle,
  availableCopies,
  isOwner,
}: {
  bookId: string;
  bookTitle: string;
  availableCopies: number;
  isOwner: boolean;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);

  function handleBorrowClick() {
    if (!session?.user) {
      router.push(getLoginHref(window.location.pathname + window.location.search));
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        disabled={availableCopies <= 0 || isOwner || isPending}
        onClick={handleBorrowClick}
        className="site-button site-button-primary"
      >
        {isOwner
          ? "Your book"
          : availableCopies <= 0
            ? "Not Available"
            : isPending
              ? "Checking account..."
              : "Borrow this book"}
      </button>
      <BorrowDialog
        bookId={bookId}
        bookTitle={bookTitle}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
