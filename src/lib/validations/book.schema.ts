import { z } from "zod";
import { bookCategories } from "@/constants/categories";

const imageSchema = z
  .string()
  .max(1_400_000, "Image must be 1 MB or smaller.")
  .refine(
    (value) =>
      value === "" ||
      /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value) ||
      /^https?:\/\/\S+$/i.test(value),
    "Choose a PNG, JPEG, or WebP image, or enter a valid image URL.",
  );

export const MAX_BOOK_PDF_SIZE = 10 * 1024 * 1024;

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Enter the book title.").max(120),
  author: z.string().trim().min(1, "Enter the author name.").max(100),
  category: z.enum(bookCategories, {
    error: "Choose a book category.",
  }),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(3000, "Description must be 3000 characters or fewer."),
  image: imageSchema,
  totalCopies: z.coerce.number().int().min(1, "Total copies must be at least 1."),
});

export const borrowSchema = z.object({
  dueAt: z.iso.datetime({ error: "Choose a valid return date." }),
  message: z.string().trim().max(500, "Message must be 500 characters or fewer."),
});

export const bookResponseSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  author: z.string(),
  category: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  ownerId: z.string(),
  totalCopies: z.number().int().positive(),
  availableCopies: z.number().int().nonnegative(),
  isBorrowed: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  pdf: z
    .object({
      name: z.string(),
      size: z.number().int().nonnegative(),
    })
    .nullable(),
});

export const borrowResponseSchema = z.object({
  id: z.string().min(1),
  bookId: z.string(),
  bookTitle: z.string(),
  bookImage: z.string().nullable(),
  ownerId: z.string(),
  borrowerId: z.string(),
  status: z.enum(["active", "returned"]),
  borrowedAt: z.iso.datetime(),
  dueAt: z.iso.datetime(),
  returnedAt: z.iso.datetime().nullable(),
  message: z.string(),
});

export type BookFormValues = Omit<z.input<typeof bookSchema>, "totalCopies"> & {
  totalCopies: string;
};
export type BorrowFormValues = z.infer<typeof borrowSchema>;
