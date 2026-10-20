import type { WorldEntryKind } from "./world-kinds"

// What a row shows in front of its name.
export type Visual =
  | { type: "campaign"; name: string; imageUrl: string | null }
  | { type: "entry"; kind: WorldEntryKind; imageUrl: string | null }
  | { type: "page"; icon: string }
  | { type: "action" }

// Something that was opened lately, kept in this browser.
export type Recent = {
  key: string
  name: string
  path: string
  context: string
  visual: Visual
}

export type PaletteItem = {
  id: string
  name: string
  // Muted, at the right end of the row: the campaign, "Library" or a section.
  context: string
  path: string
  visual: Visual
  // Which letters of the name matched the search.
  matched: number[]
  // Set on what is worth remembering as recently opened.
  recent?: Recent
}

export type PaletteGroup = { heading: string; items: PaletteItem[] }
