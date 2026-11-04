import type { WorldEntryKind } from "./world-kinds"

// An entry as the test file writes it. Description and notes are in the markup of
// template-markup.ts; the notes are private. Role, type and value are short facts, and a
// location is a line at the top of the notes, since NPCs have no field for one.
export type RawEntry = {
  key: string
  kind: WorldEntryKind
  name: string
  // Left out, players see the entry from the start.
  revealed?: boolean
  description: string
  notes?: string
  role?: string
  type?: string
  value?: string
  location?: string
}
