import type { User } from "@supabase/supabase-js"

// A person's own details, read from their Supabase user metadata so they are
// available without a lookup. The username is also kept in the profiles table,
// where it is checked to be unique and can be searched; the profile form
// keeps the two in step. It is the only name a person has.
export function getProfile(user: User) {
  const meta = user.user_metadata as Record<string, string | undefined>

  return {
    username: meta.username ?? "",
    description: meta.description ?? "",
    email: user.email ?? "",
    avatarUrl: meta.avatar_url ?? "",
  }
}

export function getUsername(user: User) {
  return getProfile(user).username.trim()
}

// Two letters for a small circle: the first letters of two words ("Cool Guy"
// gives "CG"), or the first two of a single word ("bob" gives "BO"). Empty for
// a name with no letters or numbers.
export function initialsOf(name: string) {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)

  const letters =
    words.length >= 2
      ? [words[0][0], words[1][0]]
      : [...(words[0] ?? "")].slice(0, 2)

  return letters.join("").toUpperCase()
}

export function getInitials(user: User) {
  const { username, email } = getProfile(user)

  return initialsOf(username) || email.slice(0, 2).toUpperCase() || "??"
}
