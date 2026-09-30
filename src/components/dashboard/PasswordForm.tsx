import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormAlert } from "@/components/auth/FormAlert"
import { supabase } from "@/lib/supabase"
import { FormFooter } from "./FormFooter"
import { SettingsSection } from "./SettingsSection"

const MIN_LENGTH = 6

type Notice = { tone: "error" | "success"; text: string }

export function PasswordForm() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  function reset() {
    setPassword("")
    setConfirm("")
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < MIN_LENGTH) {
      return setNotice({
        tone: "error",
        text: `Use at least ${MIN_LENGTH} characters.`,
      })
    }
    if (password !== confirm) {
      return setNotice({ tone: "error", text: "The passwords do not match." })
    }

    setBusy(true)
    setNotice(null)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)

    if (error) return setNotice({ tone: "error", text: error.message })
    reset()
    setNotice({ tone: "success", text: "Your password has been updated." })
  }

  return (
    <form onSubmit={handleSubmit}>
      <SettingsSection
        title="Password"
        description="Choose a new password for your account."
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              disabled={busy}
            />
          </div>
          {notice && <FormAlert tone={notice.tone}>{notice.text}</FormAlert>}
        </div>
      </SettingsSection>
      <FormFooter
        submitLabel="Update password"
        busy={busy}
        canSubmit={password.length > 0 || confirm.length > 0}
        onCancel={() => {
          reset()
          setNotice(null)
        }}
      />
    </form>
  )
}
