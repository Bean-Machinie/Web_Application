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

export function getInitials(user: User) {
  const { displayName, email } = getProfile(user)
  const words = displayName.trim().split(/\s+/).filter(Boolean)
  const fromName = words.slice(0, 2).map((word) => word[0]).join("")

  return (fromName || email.slice(0, 2)).toUpperCase() || "??"
}
