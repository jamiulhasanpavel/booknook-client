export type BookSummary = {
  id: string;
  title: string;
  author: string;
  category: string;
  image: string | null;
};

export type BookPdfSummary = {
  name: string;
  size: number;
};

export type Book = BookSummary & {
  description: string;
  ownerId: string;
  totalCopies: number;
  availableCopies: number;
  isBorrowed: boolean;
  createdAt: string;
  updatedAt: string;
  pdf: BookPdfSummary | null;
};

export type BorrowRecord = {
  id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string | null;
  ownerId: string;
  borrowerId: string;
  status: "active" | "returned";
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  message: string;
};
