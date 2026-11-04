import type { WorldFieldType } from "./world-fields"
import type { WorldEntryKind } from "./world-kinds"

// A starter template is a bundle of entries, in the shape create_campaign
// accepts, so a library pack can later hand over the same data.
export type TemplateField = {
  key: string
  type: WorldFieldType
  value: unknown
  private?: boolean
}

export type TemplateEntry = {
  // Names the entry for mentions inside the template: a mention node whose attrs.id is
  // "tpl:<key>" points at it, and is given the new entry's id when the campaign is made.
  key?: string
  kind: WorldEntryKind
  name: string
  // Players see the entry from the start. Left out, it is true.
  revealed?: boolean
  fields: TemplateField[]
}

// A node of a Tiptap document, as plain data.
export type TemplateNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TemplateNode[]
  text?: string
  marks?: { type: string }[]
}

// A journal page of a template, with the pages inside it.
export type TemplatePage = {
  title: string
  revealed: boolean
  content: TemplateNode
  children?: TemplatePage[]
}

export type CampaignTemplate = {
  id: string
  name: string
  description: string
  // The id of the default cover a campaign made from it starts with.
  cover: string
  // Where the template's portraits live, one WebP per entry named after it
  // ("Bram Hollis" is bram-hollis.webp). Entries without a file get none.
  portraits?: string
  entries: TemplateEntry[]
  // The journal the campaign starts with, as a tree of pages.
  journalPages?: TemplatePage[]
}

// Rich text fields hold editor JSON; a template writes plain sentences.
function paragraph(text: string) {
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] }
}

export const describe = (text: string): TemplateField => ({
  key: "description",
  type: "rich_text",
  value: paragraph(text),
})

type NpcText = {
  description: string
  motivation: string
  // A roleplay cue; private, like secrets.
  voice: string
  secret: string
}

export function npc(
  name: string,
  facts: { role: string; species: string; age: string; status: string; attitude: string },
  text: NpcText
): TemplateEntry {
  return {
    kind: "npc",
    name,
    fields: [
      { key: "role", type: "short_text", value: facts.role },
      { key: "species", type: "short_text", value: facts.species },
      { key: "age", type: "short_text", value: facts.age },
      { key: "status", type: "select", value: facts.status },
      { key: "attitude", type: "select", value: facts.attitude },
      describe(text.description),
      { key: "motivation", type: "rich_text", value: paragraph(text.motivation) },
      { key: "voice", type: "short_text", value: text.voice, private: true },
      { key: "secrets", type: "rich_text", value: paragraph(text.secret), private: true },
    ],
  }
}

export const fact = (key: string, value: string, isPrivate = false): TemplateField => ({
  key,
  type: "short_text",
  value,
  private: isPrivate,
})

// A creature's stat block, private like the rest of its hidden detail.
export const statBlock = (
  stats: { health: number; defense: number; speed: string },
  actions: [name: string, text: string][]
): TemplateField => ({
  key: "stat_block",
  type: "stat_block",
  value: {
    v: 1,
    ...stats,
    actions: actions.map(([name, text], index) => ({ id: `action-${index + 1}`, name, text })),
  },
  private: true,
})

export const entry = (
  kind: WorldEntryKind,
  name: string,
  description: string,
  fields: TemplateField[] = []
): TemplateEntry => ({
  kind,
  name,
  fields: [describe(description), ...fields],
})
