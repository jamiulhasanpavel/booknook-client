"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/shared/Logo";
import { authClient } from "@/lib/auth-client";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "All Books" },
];

const privateLinks = [
  { href: "/add-book", label: "Add Book" },
  { href: "/my-books", label: "My Books" },
  { href: "/my-borrows", label: "My Borrows" },
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending, error } = authClient.useSession();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const user = error ? null : session?.user;
  const displayName = user?.name || user?.email || "Reader";

  async function handleLogout() {
    setLogoutError(null);

    try {
      const result = await authClient.signOut();
      if (result.error) {
        setLogoutError("We couldn't log you out. Please try again.");
      }
    } catch (logoutRequestError) {
      console.error("Logout request failed", logoutRequestError);
      setLogoutError("We couldn't log you out. Please try again.");
    }
  }

  function isActive(href: string) {
    return href === "/" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Logo />

        <div className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:order-2 sm:w-auto">
          {[...publicLinks, ...(user ? privateLinks : [])].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`transition-colors hover:text-primary ${
                isActive(link.href)
                  ? "font-medium text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="order-2 flex items-center gap-2 sm:order-3">
          {isPending ? (
            <span className="size-9 animate-pulse rounded-full bg-muted" aria-label="Loading account" />
          ) : user ? (
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full p-1 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <Avatar>
                  {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                  <AvatarFallback>
                    {getInitials(displayName) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
                  {displayName}
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg">
                <p className="truncate px-3 py-2 text-sm font-medium">
                  {displayName}
                </p>
                <Link
                  href="/profile"
                  onClick={(event) =>
                    event.currentTarget.closest("details")?.removeAttribute("open")
                  }
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Logout
                </button>
                {logoutError ? (
                  <p role="alert" className="px-3 py-2 text-xs text-destructive">
                    {logoutError}
                  </p>
                ) : null}
              </div>
            </details>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Register
              </Link>
            </>
          )}
        </div>
        {error ? (
          <p role="status" className="order-4 w-full text-xs text-destructive sm:text-right">
            Account status is unavailable. Check the auth server configuration.
          </p>
        ) : null}
      </nav>
    </header>
  );
}
