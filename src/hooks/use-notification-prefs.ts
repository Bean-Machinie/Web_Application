import { useStoredValue } from "./use-stored-value"

export type NotificationPref =
  | "invitations"
  | "memberLeft"
  | "removed"
  | "campaignDeleted"
  | "ownership"

type Prefs = Record<NotificationPref, boolean>

const KEY = "notification-prefs"
const ALL: Prefs = { invitations: true, memberLeft: true, removed: true, campaignDeleted: true, ownership: true }

function read(text: string | null): Prefs {
  try {
    return { ...ALL, ...JSON.parse(text ?? "{}") }
  } catch {
    return ALL
  }
}

const write = (prefs: Prefs) => JSON.stringify(prefs)

// Which kinds of notification the person wants, kept on this device. If it cannot be kept
// (private mode), the choice lasts until the page is closed.
export function useNotificationPrefs() {
  const [prefs, setPrefs] = useStoredValue(KEY, read, write)
  return { prefs, set: (pref: NotificationPref, on: boolean) => setPrefs({ ...prefs, [pref]: on }) }
}
