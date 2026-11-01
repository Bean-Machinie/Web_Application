import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/auth/useAuth"
import { readGuestReturn, withoutOAuthError } from "@/lib/oauth-error"
import { supabase } from "@/lib/supabase"

// On coming back from turning a guest into an account (a provider's sign-in, or the link in
// the confirmation email): give them a username, refresh what the app knows of them, and say
// so. After the email link the next step is a password, so that is asked for instead.
export function useGuestReturn(onEmailConfirmed: () => void) {
  const { search, hash, state } = useLocation()
  const navigate = useNavigate()
  const { loading, isGuest, refreshProfile } = useAuth()
  const handled = useRef(false)

  useEffect(() => {
    const result = readGuestReturn(search, hash)
    if (!result || handled.current || loading) return
    // The session has not caught up with the change yet.
    if (!result.error && isGuest) return

    handled.current = true
    navigate(withoutOAuthError(search, hash), { replace: true, state })

    if (result.error) {
      toast.error(result.error)
      return
    }

    void (async () => {
      // The trigger may have run before the provider's details were saved; this is safe to repeat.
      await supabase.rpc("ensure_username")
      await refreshProfile().catch(() => {})
      if (result.kind === "email") onEmailConfirmed()
      else toast.success("Account created. Your work is saved.")
    })()
  }, [search, hash, state, loading, isGuest, navigate, refreshProfile, onEmailConfirmed])
}
