const PROVIDER_NAMES: Record<string, string> = { discord: "Discord", google: "Google" }
const ERROR_PARAMS = ["error", "error_code", "error_description", "provider", "converted"]

// Supabase reports a failed provider login or link in the query or the hash,
// depending on the flow.
function readParams(search: string, hash: string) {
  const fromQuery = new URLSearchParams(search)
  const fromHash = new URLSearchParams(hash.replace(/^#/, ""))
  const get = (name: string) => fromQuery.get(name) ?? fromHash.get(name)

  return {
    error: get("error"),
    code: get("error_code"),
    description: get("error_description"),
    provider: get("provider"),
    converted: get("converted"),
  }
}

const nameOf = (provider: string | null) => PROVIDER_NAMES[provider ?? ""]

export function readOAuthError(search: string, hash: string) {
  const { error, provider } = readParams(search, hash)
  if (!error) return undefined

  const name = nameOf(provider)
  const label = name ? `${name} login` : "Login"
  return error === "access_denied"
    ? `${label} was cancelled. Try again.`
    : `${label} didn't complete. Try again.`
}

// What happened when someone came back from connecting a provider: nothing
// when they did not just try to, otherwise the provider and, if it failed, why.
export function readLinkResult(search: string, hash: string) {
  const { error, code, description, provider, converted } = readParams(search, hash)
  const name = nameOf(provider)
  // A guest turning into an account is reported by readGuestReturn.
  if (!name || converted) return undefined
  if (!error) return { name }

  if (code === "identity_already_exists" || /already linked/i.test(description ?? "")) {
    return { name, error: `That ${name} account is already linked to another Heliosyn account.` }
  }
  if (error === "access_denied") return { name, error: `Connecting ${name} was cancelled.` }
  return { name, error: `${name} couldn't be connected. Try again.` }
}

// What happened when a guest came back from becoming an account: what they used, and, if it
// failed, why.
export function readGuestReturn(search: string, hash: string) {
  const { error, code, description, converted } = readParams(search, hash)
  if (!converted) return undefined
  if (!error) return { kind: converted }

  const name = nameOf(converted) ?? "provider"
  if (code === "identity_already_exists" || /already linked/i.test(description ?? "")) {
    return {
      kind: converted,
      error: `That ${name} account already has a Heliosyn account. Log in to it instead; your guest work stays here for 30 days.`,
    }
  }
  if (code === "email_exists") {
    return { kind: converted, error: "That email already has an account. Log in instead." }
  }
  if (error === "access_denied") return { kind: converted, error: "Creating your account was cancelled." }
  if (code === "otp_expired") return { kind: converted, error: "That link has expired. Try again." }
  return { kind: converted, error: "Your account couldn't be created. Try again." }
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
