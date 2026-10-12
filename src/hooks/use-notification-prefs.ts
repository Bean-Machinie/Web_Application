import { useState } from "react"

export type NotificationPref =
  | "invitations"
  | "memberLeft"
  | "removed"
  | "campaignDeleted"
  | "ownership"

const KEY = "notification-prefs"

function read(): Record<NotificationPref, boolean> {
  const all = { invitations: true, memberLeft: true, removed: true, campaignDeleted: true, ownership: true }
  try {
    return { ...all, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }
  } catch {
    return all
  }
}

// Which kinds of notification the person wants, kept on this device.
export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState(read)

  function set(pref: NotificationPref, on: boolean) {
    const next = { ...prefs, [pref]: on }
    setPrefs(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // Private mode: the choice lasts until the page is closed.
    }
  }

  return { prefs, set }
}
