import { useCallback, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/auth/useAuth"
import { useGuestReturn } from "@/hooks/use-guest-return"
import { AccountDialogContext } from "./AccountDialogContext"
import { AccountRequiredDialog } from "./AccountRequiredDialog"
import { SetPasswordDialog } from "./SetPasswordDialog"

// One account dialog for the whole app, so every locked feature opens the same one.
export function AccountDialogProvider({ children }: { children: ReactNode }) {
  const { isGuest } = useAuth()
  const [request, setRequest] = useState<{ action?: string } | null>(null)
  const [settingPassword, setSettingPassword] = useState(false)

  const openFor = useCallback((action?: string) => setRequest({ action }), [])
  const gate = useCallback(
    (action: string, run: () => void) => (isGuest ? openFor(action) : run()),
    [isGuest, openFor]
  )
  const askForPassword = useCallback(() => setSettingPassword(true), [])

  useGuestReturn(askForPassword)

  return (
    <AccountDialogContext.Provider value={{ isGuest, openFor, gate }}>
      {children}
      {/* Closes by itself once the guest has become an account. */}
      <AccountRequiredDialog
        open={request !== null && isGuest}
        action={request?.action}
        onClose={() => setRequest(null)}
      />
      <SetPasswordDialog open={settingPassword} onClose={() => setSettingPassword(false)} />
    </AccountDialogContext.Provider>
  )
}
