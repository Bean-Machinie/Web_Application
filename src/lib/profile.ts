import type { User } from "@supabase/supabase-js"

// Profile fields live in Supabase auth user_metadata, so no table is needed.
export function getProfile(user: User) {
  const meta = user.user_metadata as Record<string, string | undefined>

  return {
    firstName: meta.first_name ?? "",
    lastName: meta.last_name ?? "",
    jobTitle: meta.job_title ?? "",
    email: user.email ?? "",
    avatarUrl: meta.avatar_url ?? "",
  }
}

export function getDisplayName(user: User) {
  const { firstName, lastName } = getProfile(user)

  return `${firstName} ${lastName}`.trim()
}

export function getInitials(user: User) {
  const { firstName, lastName, email } = getProfile(user)
  const fromName = `${firstName[0] ?? ""}${lastName[0] ?? ""}`

  return (fromName || email.slice(0, 2)).toUpperCase() || "??"
}
