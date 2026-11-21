import { requireUser } from "@/lib/auth-guard";
import BookForm from "@/components/books/BookForm";
import PageHeading from "@/components/shared/PageHeading";

export default async function AddBookPage() {
  await requireUser("/add-book");

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading
        className="mb-8"
        eyebrow="Share a story"
        title="Add a book"
        description="Add a book to your shelf so another reader can discover it."
      />
      <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
        <BookForm />
      </div>
    </main>
  );
}
