import { useState } from "react"
import { PASSWORD_MIN_LENGTH } from "@/lib/password-strength"
import { supabase } from "@/lib/supabase"

// The state and the save for choosing a password, for the settings form and the dialog that
// follows a guest confirming their email.
export function useSetPassword() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const dirty = password.length > 0 || confirm.length > 0

  function reset() {
    setPassword("")
    setConfirm("")
  }

  // Resolves to what went wrong, or undefined once the password is set.
  async function save(): Promise<string | undefined> {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return `Use at least ${PASSWORD_MIN_LENGTH} characters.`
    }
    if (password !== confirm) return "The passwords do not match."

    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)

    return error?.message
  }

  return { password, setPassword, confirm, setConfirm, busy, dirty, reset, save }
}
