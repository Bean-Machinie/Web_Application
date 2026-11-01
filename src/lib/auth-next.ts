export const APP_HOME = "/app"

// Only in-app paths are allowed, so a crafted link cannot send someone off-site.
export function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return APP_HOME
  }
  return next
}

export function signInPath(next?: string) {
  return next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"
}

export function signUpPath(next?: string) {
  return next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"
}
