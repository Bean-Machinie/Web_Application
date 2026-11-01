import { supabase } from "@/lib/supabase"

// Mirrors the check constraint on profiles.username.
export const USERNAME_HINT =
  "2 to 50 characters. Letters, numbers, spaces and symbols are fine, but not @."

const USERNAME_PATTERN = /^[^@\p{Cc}]{2,50}$/u

// Capitals are kept as typed; names are unique ignoring them.
export const normalizeUsername = (input: string) =>
  input.trim().replace(/\s+/g, " ")

export const isValidUsername = (input: string) =>
  USERNAME_PATTERN.test(normalizeUsername(input))

export async function setUsername(username: string) {
  const { error } = await supabase.rpc("set_username", {
    new_username: username,
  })
  if (error) throw error
}

// The signed-in person's own name. It is read from the profile row, never from
// user metadata, which the person can edit.
export async function fetchOwnUsername(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle()
  if (error) throw error

  return data?.username ?? ""
}

// Callable before signing in, so the create account form can check first.
export async function isUsernameAvailable(username: string) {
  const { data, error } = await supabase.rpc("username_available", {
    candidate: username,
  })
  if (error) throw error

  return data as boolean
}
