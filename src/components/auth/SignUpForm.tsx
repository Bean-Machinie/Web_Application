import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { AuthField } from "@/components/auth/AuthField"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { CheckEmail } from "@/components/auth/CheckEmail"
import { FormAlert } from "@/components/auth/FormAlert"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { OrDivider } from "@/components/auth/OrDivider"
import { SubmitButton } from "@/components/auth/SubmitButton"
import { PasswordField } from "@/components/dashboard/PasswordField"
import { PasswordStrength } from "@/components/dashboard/PasswordStrength"
import { Input } from "@/components/ui/input"
import { authProblem } from "@/lib/auth-errors"
import type { AuthProblem } from "@/lib/auth-errors"
import { safeNext, signInPath } from "@/lib/auth-next"
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

export function SignUpForm() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [problem, setProblem] = useState<Problem>()
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState<string>()
  const navigate = useNavigate()
  const rawNext = useSearchParams()[0].get("next")
  const next = safeNext(rawNext)
  const redirectTo = `${window.location.origin}${next}`

  async function register(): Promise<Problem | undefined> {
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
      return { field: "email", message: "An account with this email already exists. Try signing in." }
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

  if (sentTo) return <CheckEmail email={sentTo} onResend={resend} />

  const errorFor = (field: Problem["field"]) =>
    problem?.field === field ? problem.message : undefined

  return (
    <AuthLayout title="Create your account" description="Start building your world">
      <OAuthButtons next={next} disabled={busy} />
      <OrDivider />
      <form onSubmit={submit} className="flex flex-col gap-4">
        <AuthField id="username" label="Display name" error={errorFor("username")}>
          <Input
            id="username"
            autoComplete="username"
            spellCheck={false}
            required
            maxLength={50}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={busy}
          />
        </AuthField>
        <AuthField id="email" label="Email" error={errorFor("email")}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
        </AuthField>
        <AuthField id="password" label="Password" error={errorFor("password")}>
          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            disabled={busy}
          />
          <PasswordStrength password={password} minLength={PASSWORD_MIN_LENGTH} />
        </AuthField>
        {errorFor("form") && <FormAlert tone="error">{errorFor("form")!}</FormAlert>}
        <SubmitButton busy={busy}>Create account</SubmitButton>
      </form>
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link to={signInPath(rawNext ?? undefined)} className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
