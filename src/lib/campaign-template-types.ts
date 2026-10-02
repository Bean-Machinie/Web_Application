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
  kind: WorldEntryKind
  name: string
  fields: TemplateField[]
}

export type CampaignTemplate = {
  id: string
  name: string
  description: string
  // Where the template's portraits live, one WebP per entry named after it
  // ("Bram Hollis" is bram-hollis.webp). Entries without a file get none.
  portraits?: string
  entries: TemplateEntry[]
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

export function character(
  name: string,
  facts: { role: string; status: string; attitude: string },
  description: string,
  secret: string
): TemplateEntry {
  return {
    kind: "character",
    name,
    fields: [
      { key: "role", type: "short_text", value: facts.role },
      { key: "status", type: "select", value: facts.status },
      { key: "attitude", type: "select", value: facts.attitude },
      describe(description),
      { key: "secrets", type: "rich_text", value: paragraph(secret), private: true },
    ],
  }
}

export const entry = (kind: WorldEntryKind, name: string, description: string): TemplateEntry => ({
  kind,
  name,
  fields: [describe(description)],
})
