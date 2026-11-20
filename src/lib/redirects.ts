const redirectBase = "http://booknook.local";

export function getSafeReturnTo(value: string | null | undefined) {
  if (!value) {
    return "/";
  }

  try {
    const url = new URL(value, redirectBase);

    if (
      url.origin !== redirectBase ||
      url.pathname.startsWith("//") ||
      /^\/(login|register)(\/|$)/.test(url.pathname)
    ) {
      return "/";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function getLoginHref(returnTo: string) {
  const safeReturnTo = getSafeReturnTo(returnTo);
  return safeReturnTo === "/"
    ? "/login"
    : `/login?callbackUrl=${encodeURIComponent(safeReturnTo)}`;
}
