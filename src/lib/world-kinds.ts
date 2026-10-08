import { BookOpen, Map as MapIcon, MapPin, Package, PawPrint, User } from "lucide-react"
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
  | "map"

// The colour of the dot beside a select option.
export type Tone = "positive" | "neutral" | "negative" | "warning"

export type FieldDef = {
  key: string
  label: string
  type: WorldFieldType
  // Only the registry decides this; the database stores the flag for any field.
  canBePrivate: boolean
  placeholder?: string
  // For select fields: the choices, in order. The key is what gets stored.
  options?: { value: string; label: string; tone?: Tone }[]
  // A private field starts out private, even before anything is saved.
  privateByDefault?: boolean
  // Shown as a compact fact beside the name instead of as a section below.
  summary?: boolean
}

type KindDef = {
  label: string
  plural: string
  icon: LucideIcon
  // Example in the name box of the create dialog.
  namePlaceholder: string
  fields: FieldDef[]
}

// The field shown as the entry's picture: at the top of its page and as the
// cover of its card. Every kind has one.
export const COVER_FIELD = "image"

export const STAT_BLOCK_FIELD = "stat_block"

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

function shortText(
  key: string,
  label: string,
  placeholder: string,
  extra: Partial<FieldDef> = {}
): FieldDef {
  return { key, label, type: "short_text", canBePrivate: false, placeholder, ...extra }
}

// Health, defense and speed show beside the image; the actions below it.
function statBlock(): FieldDef {
  return {
    key: STAT_BLOCK_FIELD,
    label: "Actions",
    type: "stat_block",
    canBePrivate: true,
    privateByDefault: true,
  }
}

function richText(key: string, label: string, placeholder: string, extra: Partial<FieldDef> = {}): FieldDef {
  return { key, label, type: "rich_text", canBePrivate: true, placeholder, ...extra }
}

function select(
  key: string,
  label: string,
  options: [label: string, tone: Tone][]
): FieldDef {
  return {
    key,
    label,
    type: "select",
    canBePrivate: true,
    summary: true,
    options: options.map(([name, tone]) => ({ value: name.toLowerCase(), label: name, tone })),
  }
}

export const WORLD_KINDS: Record<WorldEntryKind, KindDef> = {
  character: {
    label: "Character",
    plural: "Characters",
    icon: User,
    namePlaceholder: "e.g. Bram the innkeeper",
    fields: [
      image(),
      shortText("role", "Role", "e.g. Innkeeper", { summary: true }),
      shortText("species", "Species", "e.g. Half-elf", { summary: true }),
      shortText("age", "Age", "e.g. Middle-aged", { summary: true }),
      select("status", "Status", [
        ["Alive", "positive"],
        ["Dead", "negative"],
        ["Missing", "warning"],
      ]),
      select("attitude", "Attitude", [
        ["Friendly", "positive"],
        ["Neutral", "neutral"],
        ["Hostile", "negative"],
      ]),
      description("Who are they, what do they want, what do they hide?"),
      richText("motivation", "Motivation", "What do they want, and what will they do to get it?"),
      shortText("voice", "Voice & mannerisms", "e.g. Gruff, taps the bar when lying", {
        canBePrivate: true,
        privateByDefault: true,
      }),
      richText("secrets", "Secrets", "What are they hiding? Only you see this until you reveal it.", {
        privateByDefault: true,
      }),
    ],
  },
  creature: {
    label: "Creature",
    plural: "Creatures",
    icon: PawPrint,
    namePlaceholder: "e.g. Mossback troll",
    fields: [
      image(),
      shortText("type", "Type", "e.g. Beast", { summary: true }),
      shortText("threat", "Threat", "e.g. CR 3 or Tier II", { summary: true, canBePrivate: true }),
      description("What is it, where does it live, how does it behave?"),
      statBlock(),
      richText("weaknesses", "Weaknesses", "What hurts it, scares it or shuts it down?", {
        privateByDefault: true,
      }),
    ],
  },
  location: {
    label: "Location",
    plural: "Locations",
    icon: MapPin,
    namePlaceholder: "e.g. The Gilded Stag",
    fields: [
      image(),
      shortText("type", "Type", "e.g. Village", { summary: true }),
      description("What does it look like, and what happens here?"),
      richText("secrets", "Secrets", "What is hidden here? Only you see this until you reveal it.", {
        privateByDefault: true,
      }),
    ],
  },
  item: {
    label: "Item",
    plural: "Items",
    icon: Package,
    namePlaceholder: "e.g. Sword of Dawn",
    fields: [
      image(),
      shortText("type", "Type", "e.g. Weapon", { summary: true }),
      shortText("value", "Value", "e.g. 50 gp or 2 coin", { summary: true, canBePrivate: true }),
      description("What is it, what does it do, who has it?"),
      richText("hidden_properties", "Hidden properties", "Curses, secret powers or true origin.", {
        privateByDefault: true,
      }),
    ],
  },
  lore: {
    label: "Lore",
    plural: "Lore",
    icon: BookOpen,
    namePlaceholder: "e.g. The Sundering",
    fields: [
      image(),
      shortText("category", "Category", "e.g. History", { summary: true }),
      description("The history, legend or rule worth remembering."),
      richText("truth", "The truth", "What really happened? Only you see this until you reveal it.", {
        privateByDefault: true,
      }),
    ],
  },
  map: {
    label: "Map",
    plural: "Maps",
    icon: MapIcon,
    namePlaceholder: "e.g. The Northern Marches",
    // The picture is the map itself, uploaded in the map viewer.
    fields: [image(), description("What does this map show, and what is worth finding on it?")],
  },
}

export const worldKinds = Object.keys(WORLD_KINDS) as WorldEntryKind[]