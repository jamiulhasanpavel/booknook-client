"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const themeStorageKey = "booknook-theme";

export default function ThemeToggle() {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem(themeStorageKey);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = savedTheme ? savedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", dark);
  }, []);

  function toggleTheme() {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem(themeStorageKey, dark ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="inline-flex size-10 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Moon aria-hidden="true" className="size-4 dark:hidden" />
      <Sun aria-hidden="true" className="hidden size-4 dark:block" />
    </button>
  );
}
