import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const PARAM = "notifications"

// The full list of notifications is a panel over the page, "?notifications", like the settings
// window (see use-settings-window.ts): opening it adds a step to the history so Back closes it.
export function useNotificationsPanel() {
  const location = useLocation()
  const navigate = useNavigate()
  const isOpen = new URLSearchParams(location.search).has(PARAM)
  const state = location.state as { notificationsPanel?: boolean } | null

  const open = useCallback(() => {
    const search = new URLSearchParams(location.search)
    search.set(PARAM, "")
    navigate(
      { search: `?${search}`.replace(`${PARAM}=`, PARAM) },
      { state: { ...state, notificationsPanel: true } }
    )
  }, [location.search, navigate, state])

  const close = useCallback(() => {
    if (state?.notificationsPanel) return navigate(-1)
    const search = new URLSearchParams(location.search)
    search.delete(PARAM)
    const text = search.toString()
    navigate({ search: text && `?${text}` }, { replace: true, state: location.state })
  }, [location.search, location.state, navigate, state])

  return { isOpen, open, close }
}
