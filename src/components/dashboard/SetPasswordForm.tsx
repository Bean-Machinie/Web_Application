import { toast } from "sonner"
import { useSetPassword } from "@/hooks/use-set-password"
import { PASSWORD_MIN_LENGTH } from "@/lib/password-strength"
import { PasswordField } from "./PasswordField"
import { PasswordStrength } from "./PasswordStrength"
import { SettingsHelp, SettingsRow } from "./SettingsRow"
import { useSettingsForm, useSettingsNotice } from "./settings-form"

// For someone who signed up through a provider and has no password yet.
export function SetPasswordForm({ onDone }: { onDone: () => Promise<void> }) {
  const { password, setPassword, confirm, setConfirm, busy, dirty, reset, save } = useSetPassword()
  const notify = useSettingsNotice()

  async function submit() {
    notify(null)
    const failure = await save()
    if (failure) return notify({ tone: "error", text: failure })

    reset()
    // A toast, since this form is replaced by the change-password one straight after.
    toast.success("Password set. You can now log in with your email too.")
    await onDone()
  }

  useSettingsForm({
    dirty,
    busy,
    save: submit,
    discard: () => {
      reset()
      notify(null)
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (dirty && !busy) void submit()
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
