import { requireUser } from "@/lib/auth-guard";
import MyBorrowsTable from "@/components/borrow/MyBorrowsTable";
import { getBorrowsForUser } from "@/services/borrow.service";
import PageHeading from "@/components/shared/PageHeading";

export default async function MyBorrowsPage() {
  const user = await requireUser("/my-borrows");
  const borrows = await getBorrowsForUser(user.id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading
        className="mb-8"
        eyebrow="Reading together"
        title="My Borrows"
        description="Track books you have borrowed and lent."
      />
      <MyBorrowsTable initialBorrows={borrows} currentUserId={user.id} />
    </main>
  );
}
