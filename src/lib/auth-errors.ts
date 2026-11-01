import type { AuthError } from "@supabase/supabase-js"

export type AuthField = "email" | "password" | "form"
export type AuthProblem = { field: AuthField; message: string }

const BY_CODE: Record<string, AuthProblem> = {
  invalid_credentials: { field: "password", message: "Wrong email or password." },
  email_not_confirmed: { field: "email", message: "Confirm your email first. Check your inbox for the link." },
  user_already_exists: { field: "email", message: "An account with this email already exists. Try logging in." },
  email_exists: { field: "email", message: "An account with this email already exists. Try logging in." },
  email_address_invalid: { field: "email", message: "That email address doesn't look right." },
  validation_failed: { field: "email", message: "That email address doesn't look right." },
  weak_password: { field: "password", message: "That password is too easy to guess. Try a longer or more varied one." },
  same_password: { field: "password", message: "Choose a password you haven't used before." },
  signup_disabled: { field: "form", message: "New accounts are turned off right now." },
  over_request_rate_limit: { field: "form", message: "Too many attempts. Wait a minute and try again." },
  over_email_send_rate_limit: { field: "form", message: "We've sent a few emails already. Wait a minute and try again." },
  over_sms_send_rate_limit: { field: "form", message: "Too many attempts. Wait a minute and try again." },
  otp_expired: { field: "form", message: "That link has expired. Request a new one." },
  session_expired: { field: "form", message: "Your session ended. Log in again." },
  manual_linking_disabled: { field: "form", message: "Connecting accounts isn't turned on yet." },
  identity_already_exists: { field: "form", message: "That account is already connected to another user." },
  single_identity_not_deletable: { field: "form", message: "Connect another account before disconnecting this one." },
  anonymous_provider_disabled: { field: "form", message: "Guest mode isn't available right now." },
  provider_disabled: { field: "form", message: "That way of logging in isn't available yet." },
}

export function authProblem(error: AuthError): AuthProblem {
  if (error.code && BY_CODE[error.code]) return BY_CODE[error.code]
  if (error.name === "AuthRetryableFetchError") {
    return { field: "form", message: "Can't reach the server. Check your connection and try again." }
  }
  return { field: "form", message: "Something went wrong. Please try again." }
}
