import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAccountDialog } from "./useAccountDialog"

// For a page a guest cannot use: asks for an account, and takes them back to the app home.
export function GuestRedirect({ action }: { action: string }) {
  const navigate = useNavigate()
  const { openFor } = useAccountDialog()

  useEffect(() => {
    openFor(action)
    navigate("/app", { replace: true })
  }, [action, navigate, openFor])

  return null
}
