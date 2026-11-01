import { useEffect, useRef, useState } from "react"
import { AuthField } from "@/components/auth/AuthField"
import { FormAlert } from "@/components/auth/FormAlert"
import { SubmitButton } from "@/components/auth/SubmitButton"
import { Input } from "@/components/ui/input"
import { authProblem } from "@/lib/auth-errors"
import { guestReturnUrl } from "@/lib/auth-next"
import { errorMessage } from "@/lib/campaigns"
import { supabase } from "@/lib/supabase"
import {
  USERNAME_HINT,
  isUsernameAvailable,
  isValidUsername,
  normalizeUsername,
} from "@/lib/username"

type Problem = { field: "username" | "email" | "form"; message: string }

// Adds an email to the guest's account. The address is only theirs once they have followed
// the link, which brings them back to where they were. The password comes after that.
export function GuestEmailForm({ onSent }: { onSent: (email: string) => void }) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [problem, setProblem] = useState<Problem>()
  const [busy, setBusy] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)

  useEffect(() => nameInput.current?.focus(), [])

  async function send(): Promise<Problem | undefined> {
    if (!isValidUsername(username)) return { field: "username", message: USERNAME_HINT }
    try {
      if (!(await isUsernameAvailable(username))) {
        return { field: "username", message: "That name is taken." }
      }
    } catch (failure) {
      return { field: "form", message: errorMessage(failure) }
    }

    const { error } = await supabase.auth.updateUser(
      { email, data: { username: normalizeUsername(username) } },
      { emailRedirectTo: guestReturnUrl("email") }
    )
    if (error?.code === "email_exists" || error?.code === "user_already_exists") {
      return { field: "email", message: "That email already has an account. Log in instead." }
    }
    if (error) return { field: "form", message: authProblem(error).message }
    onSent(email)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setProblem(undefined)
    setBusy(true)
    setProblem(await send())
    setBusy(false)
  }

  const errorFor = (field: Problem["field"]) => (problem?.field === field ? problem.message : undefined)

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 p-1">
      <AuthField id="guest-username" label="Display name" hint="Shown to your party" error={errorFor("username")}>
        <Input
          ref={nameInput}
          id="guest-username"
          autoComplete="username"
          spellCheck={false}
          required
          maxLength={50}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={busy}
        />
      </AuthField>
      <AuthField id="guest-email" label="Email" error={errorFor("email")}>
        <Input
          id="guest-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
        />
      </AuthField>
      {errorFor("form") && <FormAlert tone="error">{errorFor("form")!}</FormAlert>}
      <SubmitButton busy={busy}>Create account</SubmitButton>
    </form>
  )
}
