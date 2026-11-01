import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { authProblem } from "@/lib/auth-errors"
import { APP_HOME } from "@/lib/auth-next"
import { supabase } from "@/lib/supabase"

// Starts a guest session, which is a real account that can be turned into a full one later.
export function TryAsGuest() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const navigate = useNavigate()

  async function start() {
    setError(undefined)
    setBusy(true)
    const { error } = await supabase.auth.signInAnonymously()
    setBusy(false)

    if (error) return setError(authProblem(error).message)
    navigate(APP_HOME, { replace: true })
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button variant="link" disabled={busy} onClick={start}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        Try Heliosyn without an account
      </Button>
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </div>
  )
}
