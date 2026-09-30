import { User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

// The kinds of world entry. A new kind is one more line here and one more
// value in the world_entry_kind enum; lists, pages and the create button read
// this and need no other change.
export type WorldEntryKind = "npc"

export const WORLD_KINDS: Record<
  WorldEntryKind,
  { label: string; icon: LucideIcon }
> = {
  npc: { label: "NPC", icon: User },
}

export const worldKinds = Object.keys(WORLD_KINDS) as WorldEntryKind[]
