import type { User } from "@supabase/supabase-js"

// A person's own details, read from their Supabase user metadata so they are
// available without a lookup. The username is not among them: it lives in the
// profiles table (see useAuth), because metadata is editable by the person.
export function getProfile(user: User) {
  const meta = user.user_metadata as Record<string, string | undefined>

  return {
    description: meta.description ?? "",
    email: user.email ?? "",
    avatarUrl: meta.avatar_url ?? "",
  }
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

export function getInitials(username: string, email: string) {
  return initialsOf(username) || email.slice(0, 2).toUpperCase() || "??"
}
