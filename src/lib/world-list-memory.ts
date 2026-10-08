// What the World list was showing when someone left it for an entry, so
// coming back finds it the same. Kept for the browser session.
export type WorldListMemory = {
  query: string
  scroll: number
  // The tab and view mode the scroll position belongs to; it only means
  // anything for the same list.
  signature: string
}

const listKey = (campaignId: string) => `world-list:${campaignId}`
const RETURN_KEY = "world-list-return"

function read(key: string) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, value)
  } catch {
    // Remembering is a nicety; without storage the list just opens fresh.
  }
}

export function saveWorldList(campaignId: string, memory: WorldListMemory) {
  write(listKey(campaignId), JSON.stringify(memory))
}

export function loadWorldList(campaignId: string): WorldListMemory | null {
  const text = read(listKey(campaignId))
  if (!text) return null
  try {
    return JSON.parse(text) as WorldListMemory
  } catch {
    return null
  }
}

// Set by an entry page and read by the list: only a list opened after visiting
// an entry is restored, so the sidebar's World link still opens a fresh one.
export const markWorldListReturn = () => write(RETURN_KEY, "1")
export const isWorldListReturn = () => read(RETURN_KEY) === "1"
export const clearWorldListReturn = () => write(RETURN_KEY, null)
