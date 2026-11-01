import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { readLinkResult, withoutOAuthError } from "@/lib/oauth-error"

// On coming back from connecting a provider: say how it went, then clean the
// address. The ref keeps development's doubled effect from toasting twice.
export function useLinkResult(reload: () => Promise<void>) {
  const { search, hash, state } = useLocation()
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    const result = readLinkResult(search, hash)
    if (!result || handled.current) return
    handled.current = true

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`${result.name} connected`)
      void reload()
    }
    navigate(withoutOAuthError(search, hash), { replace: true, state })
  }, [search, hash, state, navigate, reload])
}
