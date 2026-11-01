import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { useAuth } from "@/auth/useAuth"
import { CheckEmail } from "@/components/auth/CheckEmail"
import { CreateAccountFields } from "@/components/auth/CreateAccountFields"
import type { AccountValues } from "@/components/auth/CreateAccountFields"
import { EmailReveal } from "@/components/auth/EmailReveal"
import { FormAlert } from "@/components/auth/FormAlert"
import { GuestCreateAccount } from "@/components/auth/GuestCreateAccount"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { OrDivider } from "@/components/auth/OrDivider"
import { Button } from "@/components/ui/button"
import { authProblem } from "@/lib/auth-errors"
import type { AuthProblem } from "@/lib/auth-errors"
import { logInPath, safeNext } from "@/lib/auth-next"
import { errorMessage } from "@/lib/campaigns"
import { PASSWORD_MIN_LENGTH } from "@/lib/password-strength"
import { supabase } from "@/lib/supabase"
import {
  USERNAME_HINT,
  isUsernameAvailable,
  isValidUsername,
  normalizeUsername,
} from "@/lib/username"

type Problem = { field: AuthProblem["field"] | "username"; message: string }

export function CreateAccountForm() {
  const [values, setValues] = useState<AccountValues>({ username: "", email: "", password: "" })
  const [withEmail, setWithEmail] = useState(false)
  const [problem, setProblem] = useState<Problem>()
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState<string>()
  const navigate = useNavigate()
  const { isGuest } = useAuth()
  const rawNext = useSearchParams()[0].get("next")
  const next = safeNext(rawNext)
  const redirectTo = `${window.location.origin}${next}`

  async function register(): Promise<Problem | undefined> {
    const { username, email, password } = values
    if (!isValidUsername(username)) return { field: "username", message: USERNAME_HINT }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return { field: "password", message: `Use at least ${PASSWORD_MIN_LENGTH} characters.` }
    }
    try {
      if (!(await isUsernameAvailable(username))) {
        return { field: "username", message: "That name is taken." }
      }
    } catch (failure) {
      return { field: "form", message: errorMessage(failure) }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: normalizeUsername(username) }, emailRedirectTo: redirectTo },
    })
    if (error) return authProblem(error)
    // With confirmation on, Supabase hides existing accounts by returning no identities.
    if (data.user?.identities?.length === 0) {
      return { field: "email", message: "An account with this email already exists. Try logging in." }
    }
    if (data.session) navigate(next, { replace: true })
    else setSentTo(email)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setProblem(undefined)
    setBusy(true)
    setProblem(await register())
    setBusy(false)
  }

  async function resend() {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: sentTo!,
      options: { emailRedirectTo: redirectTo },
    })
    return error ? authProblem(error).message : undefined
  }

  // A guest converts the account they have; signing up would start another.
  if (isGuest) return <GuestCreateAccount next={rawNext ?? undefined} />

  if (sentTo) return <CheckEmail email={sentTo} onResend={resend} />

  const errorFor = (field: Problem["field"]) =>
    problem?.field === field ? problem.message : undefined

  return (
    <AuthLayout title="Create your account" description="Start building your world">
      <OAuthButtons next={next} disabled={busy} />
      <OrDivider />
      {withEmail ? (
        <EmailReveal>
          <CreateAccountFields
            values={values}
            onChange={(field, value) => setValues((now) => ({ ...now, [field]: value }))}
            errors={{
              username: errorFor("username"),
              email: errorFor("email"),
              password: errorFor("password"),
            }}
            busy={busy}
            onSubmit={submit}
          />
        </EmailReveal>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setWithEmail(true)}>
          Continue with email
        </Button>
      )}
      {errorFor("form") && <FormAlert tone="error">{errorFor("form")!}</FormAlert>}
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link to={logInPath(rawNext ?? undefined)} className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
