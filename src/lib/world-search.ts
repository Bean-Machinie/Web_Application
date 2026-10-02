import { supabase } from "@/lib/supabase"
import type { WorldEntry } from "./world-entries"
import { WORLD_KINDS } from "./world-kinds"

type Row = { key: string; value: unknown }

// The text of each entry's fields, by entry id.
export type SearchText = Record<string, Row[]>

// Lower case and without accents, so "elder" finds "Èlder".
export const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

// Editor JSON holds its words in "text" nodes; collect them in order.
function plainText(value: unknown): string {
  if (typeof value === "string") return value
  if (!value || typeof value !== "object") return ""
  const node = value as { text?: unknown; content?: unknown }
  const own = typeof node.text === "string" ? node.text : ""
  const inner = Array.isArray(node.content) ? node.content.map(plainText).join(" ") : ""
  return `${own} ${inner}`
}

// Every text field, so a search can look past the name. Players only receive
// the fields they may read: the database leaves private ones out.
export async function fetchSearchText(campaignId: string): Promise<SearchText> {
  const { data, error } = await supabase
    .from("world_entry_fields")
    .select("entry_id, key, value, world_entries!inner(campaign_id)")
    .eq("world_entries.campaign_id", campaignId)
    .in("type", ["rich_text", "short_text", "select"])
  if (error) throw error

  const text: SearchText = {}
  for (const row of data as unknown as (Row & { entry_id: string })[]) {
    ;(text[row.entry_id] ??= []).push({ key: row.key, value: row.value })
  }
  return text
}

// What a search looks through for one entry: its name and kind, the facts the
// list already has, and (once loaded) every text field.
function haystack(entry: WorldEntry, fields: Row[] | undefined) {
  const kind = WORLD_KINDS[entry.kind]
  const parts = [entry.name, kind.label, entry.role ?? ""]

  for (const { key, value } of fields ?? []) {
    const options = kind.fields.find((def) => def.key === key)?.options
    parts.push(options ? (options.find((o) => o.value === value)?.label ?? "") : plainText(value))
  }
  if (!fields) {
    const status = kind.fields.find((def) => def.key === "status")?.options
    parts.push(status?.find((option) => option.value === entry.status)?.label ?? "")
  }
  return normalize(parts.join(" "))
}

// Every word of the query has to appear somewhere, in any order.
export function matchesQuery(entry: WorldEntry, query: string, text: SearchText | null) {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true

  const target = haystack(entry, text?.[entry.id])
  return words.every((word) => target.includes(word))
}
