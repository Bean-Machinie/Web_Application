import { supabase } from "@/lib/supabase"
import { forgetMentionEntries } from "./mention-entries"
import { toWorldImage } from "./world-images"
import { COVER_FIELD } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

export type WorldEntry = {
  id: string
  kind: WorldEntryKind
  name: string
  // Hidden entries are GM-only; revealed ones are visible to every member.
  // The database decides who gets which rows, so a player only ever receives
  // revealed entries.
  revealed: boolean
  // Position in the GM's chosen order, lowest first.
  sortOrder: number
  createdAt: string
  updatedAt: string
  // The cover image; null when there is none or the list did not ask for it.
  imageUrl: string | null
  imagePath: string | null
  // Shown in the list and grid; null for kinds without them, or when the
  // person may not see them.
  role: string | null
  status: string | null
}

// The fields the list needs besides the entry itself.
const LIST_FIELDS = [COVER_FIELD, "role", "status"]

const COLUMNS = "id, kind, name, revealed, sort_order, created_at, updated_at"

export function toEntry(row: Record<string, unknown>): WorldEntry {
  const fields = (row.world_entry_fields as { key: string; value: unknown }[] | undefined) ?? []
  const valueOf = (key: string) => fields.find((field) => field.key === key)?.value
  const text = (key: string) => {
    const value = valueOf(key)
    return typeof value === "string" && value !== "" ? value : null
  }
  const cover = toWorldImage(valueOf(COVER_FIELD))
  return {
    id: row.id as string,
    kind: row.kind as WorldEntryKind,
    name: row.name as string,
    revealed: row.revealed as boolean,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    imageUrl: cover?.url ?? null,
    imagePath: cover?.path ?? null,
    role: text("role"),
    status: text("status"),
  }
}

const listQuery = () =>
  supabase
    .from("world_entries")
    // Named by its column: the mentions table is a second way to get from an
    // entry to a field, and without the name the query is ambiguous.
    .select(`${COLUMNS}, world_entry_fields!entry_id(key, value)`)
    // Filters the embedded rows, not the entries; row level security still
    // decides which fields each person gets.
    .in("world_entry_fields.key", LIST_FIELDS)

export async function fetchWorldEntries(campaignId: string) {
  const { data, error } = await listQuery()
    .eq("campaign_id", campaignId)
    .order("sort_order", { ascending: true })
  if (error) throw error

  return (data as Record<string, unknown>[]).map(toEntry)
}

// The signed-in person's own entries: security only lets a person read their
// own rows that have no campaign.
export async function fetchLibraryEntries() {
  const { data, error } = await listQuery()
    .is("campaign_id", null)
    .order("sort_order", { ascending: true })
  if (error) throw error

  return (data as Record<string, unknown>[]).map(toEntry)
}

// Null when it does not exist or is hidden from this person.
export async function fetchWorldEntry(id: string) {
  const { data, error } = await supabase
    .from("world_entries")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle()
  if (error) throw error

  return data ? toEntry(data as Record<string, unknown>) : null
}

export async function createWorldEntry(
  campaignId: string,
  kind: WorldEntryKind,
  name: string
) {
  const { data, error } = await supabase.rpc("create_world_entry", {
    target_campaign: campaignId,
    entry_kind: kind,
    entry_name: name,
  })
  if (error) throw error

  forgetMentionEntries()
  return toEntry(data as Record<string, unknown>)
}

export async function createLibraryEntry(kind: WorldEntryKind, name: string) {
  const { data, error } = await supabase.rpc("create_library_entry", {
    entry_kind: kind,
    entry_name: name,
  })
  if (error) throw error

  forgetMentionEntries()
  return toEntry(data as Record<string, unknown>)
}

export async function renameWorldEntry(id: string, name: string) {
  const { error } = await supabase.rpc("rename_world_entry", {
    target_entry: id,
    new_name: name,
  })
  if (error) throw error
  forgetMentionEntries()
}

export async function setWorldEntryRevealed(id: string, revealed: boolean) {
  const { error } = await supabase.rpc("set_world_entry_revealed", {
    target_entry: id,
    is_revealed: revealed,
  })
  if (error) throw error
  forgetMentionEntries()
}

export async function deleteWorldEntry(id: string) {
  const { error } = await supabase.rpc("delete_world_entry", {
    target_entry: id,
  })
  if (error) throw error
  forgetMentionEntries()
}

// Every entry of the campaign, in their new order.
export async function reorderWorldEntries(campaignId: string, orderedIds: string[]) {
  const { error } = await supabase.rpc("reorder_world_entries", {
    target_campaign: campaignId,
    ordered_ids: orderedIds,
  })
  if (error) throw error
}

export async function reorderLibraryEntries(orderedIds: string[]) {
  const { error } = await supabase.rpc("reorder_library_entries", {
    ordered_ids: orderedIds,
  })
  if (error) throw error
}

// One call for all of them: it changes every one or none. Returns how many
// changed; those already in the wanted state are left as they are.
export async function setWorldEntriesRevealed(ids: string[], revealed: boolean) {
  const { data, error } = await supabase.rpc("set_world_entries_revealed", {
    target_entries: ids,
    is_revealed: revealed,
  })
  if (error) throw error

  forgetMentionEntries()
  return data as number
}

// Likewise all or none. Returns how many were deleted.
export async function deleteWorldEntries(ids: string[]) {
  const { data, error } = await supabase.rpc("delete_world_entries", {
    target_entries: ids,
  })
  if (error) throw error

  forgetMentionEntries()
  return data as number
}

