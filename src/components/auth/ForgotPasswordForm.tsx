import { useState } from "react"
import { Link } from "react-router-dom"
import { AuthField } from "@/components/auth/AuthField"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { CheckEmail } from "@/components/auth/CheckEmail"
import { SubmitButton } from "@/components/auth/SubmitButton"
import { Input } from "@/components/ui/input"
import { authProblem } from "@/lib/auth-errors"
import { supabase } from "@/lib/supabase"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState<string>()

  async function send(address: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return error ? authProblem(error).message : undefined
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(undefined)
    setBusy(true)
    const failure = await send(email)
    setBusy(false)

    if (failure) setError(failure)
    else setSentTo(email)
  }

  if (sentTo) return <CheckEmail email={sentTo} onResend={() => send(sentTo)} />

  return (
    <AuthLayout title="Forgot your password?" description="We'll email you a link to reset it">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <AuthField id="email" label="Email" error={error}>
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
        <SubmitButton busy={busy}>Send reset link</SubmitButton>
      </form>
      <p className="text-center text-sm">
        <Link to="/log-in" className="text-muted-foreground underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  )
}
