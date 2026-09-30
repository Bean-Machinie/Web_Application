const COOKIE_NAME = "sidebar_state"

// The shadcn sidebar writes this cookie but never reads it back — in Next.js
// the server does that. Without this the sidebar forgets its state on reload.
export function readSidebarState(fallback = true) {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=(true|false)`)
  )

  return match ? match[1] === "true" : fallback
}
