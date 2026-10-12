import { useState } from "react"
import { Input } from "@/components/ui/input"
import { FormAlert } from "@/components/auth/FormAlert"
import { supabase } from "@/lib/supabase"
import { SettingsCard } from "./SettingsCard"
import { SettingsRow } from "./SettingsRow"
import { useSettingsForm } from "./settings-form"

const MIN_LENGTH = 6

type Notice = { tone: "error" | "success"; text: string }

export function PasswordForm() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const dirty = password.length > 0 || confirm.length > 0

  function reset() {
    setPassword("")
    setConfirm("")
    setNotice(null)
  }

  async function save() {
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

  useSettingsForm({ dirty, busy, save, discard: reset })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (dirty && !busy) void save()
      }}
      className="grid gap-4"
    >
      {notice && <FormAlert tone={notice.tone}>{notice.text}</FormAlert>}
      <SettingsCard>
        <SettingsRow wide title="New password" description={`At least ${MIN_LENGTH} characters.`}>
          <Input
            aria-label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
          />
        </SettingsRow>
        <SettingsRow wide title="Confirm password" description="Type the new password again.">
          <Input
            aria-label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            disabled={busy}
          />
        </SettingsRow>
      </SettingsCard>
    </form>
  )
}
