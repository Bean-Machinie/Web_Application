import { useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { supabase } from "@/lib/supabase"
import { PasswordField } from "./PasswordField"
import { PasswordStrength } from "./PasswordStrength"
import { SettingsCard } from "./SettingsCard"
import { SettingsHelp, SettingsRow } from "./SettingsRow"
import { useSettingsForm, useSettingsNotice } from "./settings-form"

const MIN_LENGTH = 6

export function PasswordForm() {
  const email = useAuth().session!.user.email ?? ""
  const [current, setCurrent] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const notify = useSettingsNotice()
  const dirty = current.length > 0 || password.length > 0 || confirm.length > 0

  function reset() {
    setCurrent("")
    setPassword("")
    setConfirm("")
    notify(null)
  }

  async function save() {
    if (!current) {
      return notify({ tone: "error", text: "Enter your current password." })
    }
    if (password.length < MIN_LENGTH) {
      return notify({
        tone: "error",
        text: `Use at least ${MIN_LENGTH} characters.`,
      })
    }
    if (password !== confirm) {
      return notify({ tone: "error", text: "The passwords do not match." })
    }

    setBusy(true)
    notify(null)
    // Supabase does not ask for the old password itself, so it is checked by signing in with it.
    const check = await supabase.auth.signInWithPassword({ email, password: current })
    if (check.error) {
      setBusy(false)
      return notify({ tone: "error", text: "Your current password is not right." })
    }
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)

    if (error) return notify({ tone: "error", text: error.message })
    reset()
    notify({ tone: "success", text: "Your password has been updated." })
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
      <SettingsCard>
        <SettingsRow width="field" title="Current password" description="To confirm it's you.">
          <PasswordField label="Current password" autoComplete="current-password" value={current} onChange={setCurrent} disabled={busy} />
        </SettingsRow>
        <SettingsRow width="field" title="New password" description="What you'll sign in with.">
          <PasswordField label="New password" autoComplete="new-password" value={password} onChange={setPassword} disabled={busy} />
          <PasswordStrength password={password} minLength={MIN_LENGTH} />
          <SettingsHelp>At least {MIN_LENGTH} characters. Mix cases, digits and symbols for a stronger one.</SettingsHelp>
        </SettingsRow>
        <SettingsRow width="field" title="Confirm password" description="Type the new one again.">
          <PasswordField label="Confirm new password" autoComplete="new-password" value={confirm} onChange={setConfirm} disabled={busy} />
        </SettingsRow>
      </SettingsCard>
    </form>
  )
}
