import { currentKindName } from "./legacy-kinds"
import type { Recent } from "./palette-items"

const MAX_KEPT = 8
const storageKey = (userId: string) => `recent-items:${userId}`

// An entry remembered before "character" became "npc" would otherwise have no icon.
function renamed(recent: Recent): Recent {
  const { visual } = recent
  return visual?.type === "entry" ? { ...recent, visual: { ...visual, kind: currentKindName(visual.kind) as typeof visual.kind } } : recent
}

// Remembered per person in this browser, newest first.
export function loadRecents(userId: string): Recent[] {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "[]")
    return Array.isArray(saved) ? saved.map(renamed) : []
  } catch {
    return []
  }
}

export function recordRecent(userId: string, recent: Recent) {
  const others = loadRecents(userId).filter((item) => item.key !== recent.key)
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([recent, ...others].slice(0, MAX_KEPT)))
  } catch {
    // Remembering is a nicety; without storage the list just stays shorter.
  }
}
