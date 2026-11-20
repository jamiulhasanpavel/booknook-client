import { requireUser } from "@/lib/auth-guard";

export default async function MyBorrowsPage() {
  await requireUser("/my-borrows");

  return <main><h1>My borrows</h1></main>;
}
