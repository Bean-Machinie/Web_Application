import { useEffect, useState } from "react"
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { AuthField } from "@/components/auth/AuthField"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { FormAlert } from "@/components/auth/FormAlert"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { OrDivider } from "@/components/auth/OrDivider"
import { SubmitButton } from "@/components/auth/SubmitButton"
import { PasswordField } from "@/components/dashboard/PasswordField"
import { Input } from "@/components/ui/input"
import { authProblem } from "@/lib/auth-errors"
import type { AuthProblem } from "@/lib/auth-errors"
import { safeNext, signUpPath } from "@/lib/auth-next"
import { readOAuthError, withoutOAuthError } from "@/lib/oauth-error"
import { supabase } from "@/lib/supabase"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [problem, setProblem] = useState<AuthProblem>()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const rawNext = useSearchParams()[0].get("next")
  const next = safeNext(rawNext)
  const { session } = useAuth()
  const location = useLocation()
  // Read once, since the address is cleaned straight afterwards.
  const [oauthError] = useState(() => readOAuthError(location.search, location.hash))

  useEffect(() => {
    if (!oauthError) return
    navigate(withoutOAuthError(location.search, location.hash), { replace: true })
  }, [oauthError, location.search, location.hash, navigate])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setProblem(undefined)
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)

    if (error) return setProblem(authProblem(error))
    navigate(next, { replace: true })
  }

  // Coming back from a provider signed in: carry on to where they were going.
  if (session && !oauthError) return <Navigate to={next} replace />

  const errorFor = (field: AuthProblem["field"]) =>
    problem?.field === field ? problem.message : undefined

  return (
    <AuthLayout title="Welcome back" description="Sign in to your account">
      <OAuthButtons next={next} disabled={busy} initialError={oauthError} />
      <OrDivider />
      <form onSubmit={submit} className="flex flex-col gap-4">
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
        <AuthField
          id="password"
          label="Password"
          error={errorFor("password")}
          aside={
            <Link to="/forgot-password" className="text-muted-foreground text-sm underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            disabled={busy}
          />
        </AuthField>
        {errorFor("form") && <FormAlert tone="error">{errorFor("form")!}</FormAlert>}
        <SubmitButton busy={busy}>Sign in</SubmitButton>
      </form>
      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to={signUpPath(rawNext ?? undefined)} className="text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
