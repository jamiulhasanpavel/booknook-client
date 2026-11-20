import { requireUser } from "@/lib/auth-guard";

export default async function ProfilePage() {
  await requireUser("/profile");

  return <main><h1>Profile</h1></main>;
}
