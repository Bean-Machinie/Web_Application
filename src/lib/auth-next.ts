export const APP_HOME = "/app"

// Only in-app paths are allowed, so a crafted link cannot send someone off-site.
export function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return APP_HOME
  }
  return next
}

export function logInPath(next?: string) {
  return next ? `/log-in?next=${encodeURIComponent(next)}` : "/log-in"
}

export function createAccountPath(next?: string) {
  return next ? `/create-account?next=${encodeURIComponent(next)}` : "/create-account"
}

// Where a provider sends people back to. It is the log in page so a failure
// can be shown there; a success is passed straight on to `next` from it.
export function oauthReturnUrl(next: string, provider: string) {
  const params = new URLSearchParams({ next, provider })
  return `${window.location.origin}/log-in?${params}`
}
