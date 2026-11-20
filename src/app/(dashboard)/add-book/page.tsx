import { requireUser } from "@/lib/auth-guard";

export default async function AddBookPage() {
  await requireUser("/add-book");

  return <main><h1>Add a book</h1></main>;
}
