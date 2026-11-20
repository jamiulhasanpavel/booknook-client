import Link from "next/link";
import { BookOpen } from "lucide-react";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="BookNook home"
      className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className ?? ""}`}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <BookOpen aria-hidden="true" className="size-5" />
      </span>
      <span className="text-xl">BookNook</span>
    </Link>
  );
}
