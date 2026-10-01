import { User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { WorldFieldType } from "./world-fields"

// The kinds of world entry. A new kind is one more entry here (with its
// fields) and one more value in the world_entry_kind enum; lists, pages and
// the create button read this and need no other change.
export type WorldEntryKind = "npc"

export type FieldDef = {
  key: string
  label: string
  type: WorldFieldType
  // Only the registry decides this; the database stores the flag for any field.
  canBePrivate: boolean
  placeholder?: string
}

export const WORLD_KINDS: Record<
  WorldEntryKind,
  { label: string; icon: LucideIcon; fields: FieldDef[] }
> = {
  npc: {
    label: "NPC",
    icon: User,
    fields: [
      {
        key: "description",
        label: "Description",
        type: "rich_text",
        canBePrivate: true,
        placeholder: "Who are they, what do they want, what do they hide?",
      },
    ],
  },
}

export const worldKinds = Object.keys(WORLD_KINDS) as WorldEntryKind[]
