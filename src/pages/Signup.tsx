import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AuthCard } from "@/components/auth/AuthCard"
import { CredentialsForm } from "@/components/auth/CredentialsForm"
import { FormAlert } from "@/components/auth/FormAlert"
import { errorMessage } from "@/lib/campaigns"
import { supabase } from "@/lib/supabase"
import {
  USERNAME_HINT,
  isUsernameAvailable,
  isValidUsername,
  normalizeUsername,
} from "@/lib/username"

export function Signup() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  // Set when someone was sent here from an invite link, so they can be taken
  // back to it afterwards.
  const from = (location.state as { from?: string } | null)?.from
  const destination =
    from?.startsWith("/") && !from.startsWith("//") ? from : "/app"

  async function handleSubmit(email: string, password: string, username: string) {
    setError(null)

    if (!isValidUsername(username)) return setError(USERNAME_HINT)
    try {
      if (!(await isUsernameAvailable(username))) {
        return setError("That username is taken.")
      }
    } catch (failure) {
      return setError(errorMessage(failure))
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: normalizeUsername(username) },
        // Where the confirmation email brings them back to.
        emailRedirectTo: `${window.location.origin}${destination}`,
      },
    })

    if (error) {
      setError(error.message)
      return
    }

    // No session means Supabase is waiting on email confirmation.
    if (data.session) {
      navigate(destination, { replace: true })
      return
    }

    setPending(true)
  }

  return (
    <AuthCard
      title="Create an account"
      description="Sign up with your email, a username and a password."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from }}
            className="underline underline-offset-4"
          >
            Log in
          </Link>
        </>
      }
    >
      {error && <FormAlert tone="error">{error}</FormAlert>}
      {pending && (
        <FormAlert tone="success">
          Check your inbox to confirm your email address.
        </FormAlert>
      )}
      <CredentialsForm
        submitLabel="Sign up"
        withUsername
        onSubmit={handleSubmit}
      />
    </AuthCard>
  )
}
