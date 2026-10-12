import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { SETTINGS_TABS } from "@/components/dashboard/settings-tabs"
import type { SettingsTab } from "@/components/dashboard/settings-tabs"

const PARAM = "settings"

const isTab = (value: string): value is SettingsTab => SETTINGS_TABS.some((tab) => tab.id === value)

// The settings window is part of the address, "?settings=appearance", over whatever page is
// under it, which is not left or reloaded. Opening it adds a step to the history, so Back
// closes it; going from tab to tab does not. The state of the page is kept as it was, for
// those that read it.
export function useSettingsWindow() {
  const location = useLocation()
  const navigate = useNavigate()
  const raw = new URLSearchParams(location.search).get(PARAM)
  const tab: SettingsTab | null = raw === null ? null : isTab(raw) ? raw : "profile"
  const state = location.state as { settingsWindow?: boolean } | null

  const open = useCallback(
    (next: SettingsTab = "profile") => {
      const search = new URLSearchParams(location.search)
      const was = search.has(PARAM)
      search.set(PARAM, next)
      navigate(
        { search: `?${search}` },
        { replace: was, state: was ? location.state : { ...state, settingsWindow: true } }
      )
    },
    [location.search, location.state, navigate, state]
  )

  const close = useCallback(() => {
    if (state?.settingsWindow) return navigate(-1)
    const search = new URLSearchParams(location.search)
    search.delete(PARAM)
    const text = search.toString()
    navigate({ search: text && `?${text}` }, { replace: true, state: location.state })
  }, [location.search, location.state, navigate, state])

  return { tab, open, close }
}
