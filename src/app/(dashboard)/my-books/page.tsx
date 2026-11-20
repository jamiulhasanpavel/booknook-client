import { requireUser } from "@/lib/auth-guard";

export default async function MyBooksPage() {
  await requireUser("/my-books");

  return <main><h1>My books</h1></main>;
}
