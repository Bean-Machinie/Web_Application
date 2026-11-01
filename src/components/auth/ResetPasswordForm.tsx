import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { AuthField } from "@/components/auth/AuthField"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { SubmitButton } from "@/components/auth/SubmitButton"
import { FullScreenSpinner } from "@/components/FullScreenSpinner"
import { PasswordField } from "@/components/dashboard/PasswordField"
import { PasswordStrength } from "@/components/dashboard/PasswordStrength"
import { authProblem } from "@/lib/auth-errors"
import { APP_HOME } from "@/lib/auth-next"
import { PASSWORD_MIN_LENGTH } from "@/lib/password-strength"
import { supabase } from "@/lib/supabase"

type Problem = { field: "password" | "confirm"; message: string }

export function ResetPasswordForm() {
  const { session, loading } = useAuth()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [problem, setProblem] = useState<Problem>()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function save(): Promise<Problem | undefined> {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return { field: "password", message: `Use at least ${PASSWORD_MIN_LENGTH} characters.` }
    }
    if (password !== confirm) return { field: "confirm", message: "The passwords do not match." }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { field: "password", message: authProblem(error).message }
    navigate(APP_HOME, { replace: true })
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setProblem(undefined)
    setBusy(true)
    setProblem(await save())
    setBusy(false)
  }

  if (loading) return <FullScreenSpinner />

  // The emailed link signs the person in, so no session means the link is bad or used.
  if (!session) {
    return (
      <AuthLayout title="Link expired" description="This reset link is invalid or has already been used.">
        <Link to="/forgot-password" className="text-foreground text-center text-sm underline underline-offset-4">
          Request a new link
        </Link>
      </AuthLayout>
    )
  }

  const errorFor = (field: Problem["field"]) =>
    problem?.field === field ? problem.message : undefined

  return (
    <AuthLayout title="Set a new password" description="Choose something you haven't used before">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <AuthField id="password" label="New password" error={errorFor("password")}>
          <PasswordField
            id="password"
            label="New password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            disabled={busy}
          />
          <PasswordStrength password={password} minLength={PASSWORD_MIN_LENGTH} />
        </AuthField>
        <AuthField id="confirm" label="Confirm password" error={errorFor("confirm")}>
          <PasswordField
            id="confirm"
            label="Confirm password"
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
            disabled={busy}
          />
        </AuthField>
        <SubmitButton busy={busy}>Reset password</SubmitButton>
      </form>
    </AuthLayout>
  )
}
