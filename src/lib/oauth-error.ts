const PROVIDER_NAMES: Record<string, string> = { discord: "Discord", google: "Google" }
const ERROR_PARAMS = ["error", "error_code", "error_description", "provider"]

// Supabase reports a failed provider sign-in in the query or the hash,
// depending on the flow.
export function readOAuthError(search: string, hash: string) {
  const fromQuery = new URLSearchParams(search)
  const fromHash = new URLSearchParams(hash.replace(/^#/, ""))
  const get = (name: string) => fromQuery.get(name) ?? fromHash.get(name)

  if (!get("error")) return undefined

  const name = PROVIDER_NAMES[get("provider") ?? ""] ?? "Sign-in"
  const label = name === "Sign-in" ? name : `${name} sign-in`
  return get("error") === "access_denied"
    ? `${label} was cancelled. Try again.`
    : `${label} didn't complete. Try again.`
}

// The same address without the error parameters, for replacing in history.
export function withoutOAuthError(search: string, hash: string) {
  const strip = (raw: string, prefix: string) => {
    const params = new URLSearchParams(raw.replace(/^[?#]/, ""))
    ERROR_PARAMS.forEach((name) => params.delete(name))
    const rest = params.toString()
    return rest ? `${prefix}${rest}` : ""
  }

  return { search: strip(search, "?"), hash: strip(hash, "#") }
}
