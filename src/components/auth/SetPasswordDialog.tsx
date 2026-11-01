import { useState } from "react"
import { toast } from "sonner"
import { AuthField } from "@/components/auth/AuthField"
import { FormAlert } from "@/components/auth/FormAlert"
import { SubmitButton } from "@/components/auth/SubmitButton"
import { PasswordField } from "@/components/dashboard/PasswordField"
import { PasswordStrength } from "@/components/dashboard/PasswordStrength"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSetPassword } from "@/hooks/use-set-password"
import { PASSWORD_MIN_LENGTH } from "@/lib/password-strength"

type Props = { open: boolean; onClose: () => void }

// Asked once a guest's email is confirmed, so they can log in with it later.
export function SetPasswordDialog({ open, onClose }: Props) {
  const { password, setPassword, confirm, setConfirm, busy, reset, save } = useSetPassword()
  const [error, setError] = useState<string>()

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(undefined)
    const failure = await save()
    if (failure) return setError(failure)

    reset()
    toast.success("Password set. You can now log in with your email too.")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Set a password</DialogTitle>
          <DialogDescription>
            Your account is ready. A password lets you log in with your email later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <AuthField id="new-password" label="Password">
            <PasswordField
              id="new-password"
              label="Password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              disabled={busy}
            />
            <PasswordStrength password={password} minLength={PASSWORD_MIN_LENGTH} />
          </AuthField>
          <AuthField id="confirm-password" label="Confirm password">
            <PasswordField
              id="confirm-password"
              label="Confirm password"
              autoComplete="new-password"
              value={confirm}
              onChange={setConfirm}
              disabled={busy}
            />
          </AuthField>
          {error && <FormAlert tone="error">{error}</FormAlert>}
          <SubmitButton busy={busy}>Set password</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  )
}
