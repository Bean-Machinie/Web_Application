import { BookOpen, MapPin, Package, PawPrint, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { WorldFieldType } from "./world-fields"

// The kinds of world entry. A new kind is one more entry here (with its
// fields) and one more value in the world_entry_kind enum; the tabs, lists,
// pages and create buttons read this and need no other change.
export type WorldEntryKind =
  | "character"
  | "creature"
  | "location"
  | "item"
  | "lore"

export type FieldDef = {
  key: string
  label: string
  type: WorldFieldType
  // Only the registry decides this; the database stores the flag for any field.
  canBePrivate: boolean
  placeholder?: string
}

type KindDef = {
  label: string
  plural: string
  icon: LucideIcon
  fields: FieldDef[]
}

// The field shown as the entry's picture: at the top of its page and as the
// cover of its card. Every kind has one.
export const COVER_FIELD = "image"

function image(): FieldDef {
  return {
    key: COVER_FIELD,
    label: "Image",
    type: "image",
    canBePrivate: false,
  }
}

function description(placeholder: string): FieldDef {
  return {
    key: "description",
    label: "Description",
    type: "rich_text",
    canBePrivate: true,
    placeholder,
  }
}

export const WORLD_KINDS: Record<WorldEntryKind, KindDef> = {
  character: {
    label: "Character",
    plural: "Characters",
    icon: User,
    fields: [image(), description("Who are they, what do they want, what do they hide?")],
  },
  creature: {
    label: "Creature",
    plural: "Creatures",
    icon: PawPrint,
    fields: [image(), description("What is it, where does it live, how does it behave?")],
  },
  location: {
    label: "Location",
    plural: "Locations",
    icon: MapPin,
    fields: [image(), description("What does it look like, and what happens here?")],
  },
  item: {
    label: "Item",
    plural: "Items",
    icon: Package,
    fields: [image(), description("What is it, what does it do, who has it?")],
  },
  lore: {
    label: "Lore",
    plural: "Lore",
    icon: BookOpen,
    fields: [image(), description("The history, legend or rule worth remembering.")],
  },
}

export const worldKinds = Object.keys(WORLD_KINDS) as WorldEntryKind[]
