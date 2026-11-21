import { Mail } from "lucide-react";
import Logo from "@/components/shared/Logo";

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", mark: "IG" },
  { href: "https://facebook.com", label: "Facebook", mark: "f" },
  { href: "https://x.com", label: "X", mark: "X" },
];

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            A cozy corner for readers to discover, share, and borrow books.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Get in touch</h2>
          <a
            href="mailto:hello@booknook.example"
            className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Mail aria-hidden="true" className="size-4" />
            hello@booknook.example
          </a>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Follow BookNook</h2>
          <div className="mt-3 flex gap-3">
            {socialLinks.map(({ href, label, mark }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {label === "X" ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-4 fill-current"
                  >
                    <path d="M18.901 1.153h3.68l-8.04 9.19 9.46 12.5h-7.406l-5.8-7.584-6.64 7.584h-3.68l8.6-9.83L.05 1.153h7.594l5.24 6.93zm-1.29 19.49h2.04L6.486 3.238h-2.19z" />
                  </svg>
                ) : (
                  <span aria-hidden="true" className="text-xs font-semibold">
                    {mark}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BookNook. All rights reserved.
      </div>
    </footer>
  );
}
