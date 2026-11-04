import type { TemplateEntry, TemplateField } from "./campaign-template-types"
import { GOBLIN_NPCS } from "./goblin-arrows-npcs"
import { GOBLIN_CREATURES, GOBLIN_LOCATIONS } from "./goblin-arrows-places"
import type { RawEntry } from "./goblin-arrows-raw"
import { GOBLIN_ITEMS, GOBLIN_LORE } from "./goblin-arrows-things"
import { markup } from "./template-markup"
import type { Labels } from "./template-markup"
import type { WorldEntryKind } from "./world-kinds"

const RAW: RawEntry[] = [...GOBLIN_NPCS, ...GOBLIN_CREATURES, ...GOBLIN_LOCATIONS, ...GOBLIN_ITEMS, ...GOBLIN_LORE]

// What the file calls "GM notes", in the private rich text field each kind has for it.
const NOTES_FIELD: Record<WorldEntryKind, string> = {
  npc: "secrets",
  creature: "weaknesses",
  location: "secrets",
  item: "hidden_properties",
  lore: "truth",
  map: "description",
}

// The names a mention chip shows, by key. Pages use them too.
export const GOBLIN_LABELS: Labels = Object.fromEntries(RAW.map((raw) => [raw.key, raw.name]))

function convert(raw: RawEntry): TemplateEntry {
  const short = (key: string, value: string | undefined): TemplateField[] =>
    value ? [{ key, type: "short_text", value }] : []
  const notes = [raw.location && `Location: ${raw.location}`, raw.notes?.trim()].filter(Boolean).join("\n\n")

  return {
    key: raw.key,
    kind: raw.kind,
    name: raw.name,
    revealed: raw.revealed ?? true,
    fields: [
      { key: "description", type: "rich_text", value: markup(raw.description, GOBLIN_LABELS) },
      ...short("role", raw.role),
      ...short("type", raw.type),
      ...short("value", raw.value),
      ...(notes
        ? [{ key: NOTES_FIELD[raw.kind], type: "rich_text" as const, value: markup(notes, GOBLIN_LABELS), private: true }]
        : []),
    ],
  }
}

export const GOBLIN_ENTRIES: TemplateEntry[] = RAW.map(convert)
