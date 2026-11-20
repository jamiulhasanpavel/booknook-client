import "server-only";

import type { ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";
import type { BookSummary } from "@/types/book";

type BookDocument = {
  _id: ObjectId;
  title: string;
  author: string;
  category: string;
  image?: string | null;
  createdAt: Date;
};

export async function getLatestBooks(): Promise<BookSummary[]> {
  const books = await getMongoDb()
    .collection<BookDocument>("books")
    .find(
      {},
      {
        projection: {
          title: 1,
          author: 1,
          category: 1,
          image: 1,
          createdAt: 1,
        },
      },
    )
    .sort({ createdAt: -1, _id: -1 })
    .limit(6)
    .toArray();

  return books.map((book) => ({
    id: book._id.toString(),
    title: book.title,
    author: book.author,
    category: book.category,
    image: book.image ?? null,
  }));
}
