import { supabase } from "@/lib/supabase"

// Mirrors the check constraint on profiles.username.
export const USERNAME_HINT =
  "3 to 20 characters: lowercase letters, numbers and underscores."

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/

export const normalizeUsername = (input: string) => input.trim().toLowerCase()
export const isValidUsername = (input: string) =>
  USERNAME_PATTERN.test(normalizeUsername(input))

export async function fetchMyUsername(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single()
  if (error) throw error

  return (data.username as string | null) ?? ""
}

export async function setUsername(username: string) {
  const { error } = await supabase.rpc("set_username", {
    new_username: username,
  })
  if (error) throw error
}

// Callable before signing in, so the sign-up form can check first.
export async function isUsernameAvailable(username: string) {
  const { data, error } = await supabase.rpc("username_available", {
    candidate: username,
  })
  if (error) throw error

  return data as boolean
}
