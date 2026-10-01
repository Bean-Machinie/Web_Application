import type { WorldEntry } from "@/lib/world-entries"
import type { MemberAction } from "./MemberMenu"

// What a person with manage_world can do to entries; null for players. The
// table uses actionsFor; the grid builds its own menu from the individual
// actions.
export type WorldManage = {
  onReveal: (entry: WorldEntry, revealed: boolean) => void
  onRename: (entry: WorldEntry) => void
  onDelete: (entry: WorldEntry) => void
  actionsFor: (entry: WorldEntry) => MemberAction[]
}
