import { supabase } from "@/lib/supabase"

// A person's own details, from the profiles table. User metadata is editable by the
// person, and providers rewrite parts of it on every login, so nothing is read from it.
export type OwnProfile = {
  username: string
  avatarUrl: string
  avatarPath: string | null
  description: string
}

export const EMPTY_PROFILE: OwnProfile = {
  username: "",
  avatarUrl: "",
  avatarPath: null,
  description: "",
}

export async function fetchOwnProfile(userId: string): Promise<OwnProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, avatar_url, avatar_path, description")
    .eq("id", userId)
    .maybeSingle()
  if (error) throw error
  if (!data) return EMPTY_PROFILE

  return {
    username: data.username ?? "",
    avatarUrl: data.avatar_url ?? "",
    avatarPath: data.avatar_path,
    description: data.description ?? "",
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
