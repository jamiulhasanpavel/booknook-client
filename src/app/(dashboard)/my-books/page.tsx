import { requireUser } from "@/lib/auth-guard";
import MyBooksTable from "@/components/books/MyBooksTable";
import { getBooksByOwner } from "@/services/book.service";
import PageHeading from "@/components/shared/PageHeading";

export default async function MyBooksPage() {
  const user = await requireUser("/my-books");
  const books = await getBooksByOwner(user.id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading
        className="mb-8"
        eyebrow="Your collection"
        title="My Books"
        description="Manage the books you have shared with BookNook readers."
      />
      <MyBooksTable initialBooks={books} />
    </main>
  );
}
