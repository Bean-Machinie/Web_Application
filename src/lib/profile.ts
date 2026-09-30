import type { User } from "@supabase/supabase-js"

// Profile fields live in Supabase auth user_metadata, so no table is needed.
// Only a display name and a short description are kept, never a legal name.
export function getProfile(user: User) {
  const meta = user.user_metadata as Record<string, string | undefined>

  return {
    displayName: meta.display_name ?? "",
    description: meta.description ?? "",
    email: user.email ?? "",
    avatarUrl: meta.avatar_url ?? "",
  }
}

export function getDisplayName(user: User) {
  return getProfile(user).displayName.trim()
}

// Up to two capitals from the first two words, or "" for an empty name.
export function initialsOf(name: string) {
  // The first letter or number of each word, so "Salt & Iron" gives "SI".
  const letters = name
    .split(/\s+/)
    .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0])
    .filter(Boolean)

  return letters.slice(0, 2).join("").toUpperCase()
}

export function getInitials(user: User) {
  const { displayName, email } = getProfile(user)

  return initialsOf(displayName) || email.slice(0, 2).toUpperCase() || "??"
}
