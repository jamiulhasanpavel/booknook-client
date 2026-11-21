import { requireUser } from "@/lib/auth-guard";
import PageHeading from "@/components/shared/PageHeading";

export default async function ProfilePage() {
  await requireUser("/profile");

  return (
    <main className="mx-auto min-h-[50vh] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading title="Profile" description="Your BookNook account." />
    </main>
  );
}
