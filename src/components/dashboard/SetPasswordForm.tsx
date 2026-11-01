import { useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { PASSWORD_MIN_LENGTH } from "@/lib/password-strength"
import { PasswordField } from "./PasswordField"
import { PasswordStrength } from "./PasswordStrength"
import { SettingsHelp, SettingsRow } from "./SettingsRow"
import { useSettingsForm, useSettingsNotice } from "./settings-form"

// For someone who signed up through a provider and has no password yet.
export function SetPasswordForm({ onDone }: { onDone: () => Promise<void> }) {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const notify = useSettingsNotice()
  const dirty = password.length > 0 || confirm.length > 0

  function reset() {
    setPassword("")
    setConfirm("")
    notify(null)
  }

  async function save() {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return notify({ tone: "error", text: `Use at least ${PASSWORD_MIN_LENGTH} characters.` })
    }
    if (password !== confirm) {
      return notify({ tone: "error", text: "The passwords do not match." })
    }

    setBusy(true)
    notify(null)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)

    if (error) return notify({ tone: "error", text: error.message })
    reset()
    // A toast, since this form is replaced by the change-password one straight after.
    toast.success("Password set. You can now log in with your email too.")
    await onDone()
  }

  useSettingsForm({ dirty, busy, save, discard: reset })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (dirty && !busy) void save()
      }}
      className="divide-y"
    >
      <SettingsRow width="field" title="Set a password" description="So you can also log in with your email.">
        <PasswordField label="New password" autoComplete="new-password" value={password} onChange={setPassword} disabled={busy} />
        <PasswordStrength password={password} minLength={PASSWORD_MIN_LENGTH} />
        <SettingsHelp>At least {PASSWORD_MIN_LENGTH} characters. Mix cases, digits and symbols for a stronger one.</SettingsHelp>
      </SettingsRow>
      <SettingsRow width="field" title="Confirm password" description="Type it again.">
        <PasswordField label="Confirm password" autoComplete="new-password" value={confirm} onChange={setConfirm} disabled={busy} />
      </SettingsRow>
    </form>
  )
}
