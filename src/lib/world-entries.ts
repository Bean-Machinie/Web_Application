import { supabase } from "@/lib/supabase"
import type { WorldEntryKind } from "./world-kinds"

export type WorldEntry = {
  id: string
  kind: WorldEntryKind
  name: string
  // Hidden entries are GM-only; revealed ones are visible to every member.
  // The database decides who gets which rows, so a player only ever receives
  // revealed entries.
  revealed: boolean
  createdAt: string
}

const COLUMNS = "id, kind, name, revealed, created_at"

function toEntry(row: Record<string, unknown>): WorldEntry {
  return {
    id: row.id as string,
    kind: row.kind as WorldEntryKind,
    name: row.name as string,
    revealed: row.revealed as boolean,
    createdAt: row.created_at as string,
  }
}

export async function fetchWorldEntries(campaignId: string) {
  const { data, error } = await supabase
    .from("world_entries")
    .select(COLUMNS)
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
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

  return toEntry(data as Record<string, unknown>)
}

export async function renameWorldEntry(id: string, name: string) {
  const { error } = await supabase.rpc("rename_world_entry", {
    target_entry: id,
    new_name: name,
  })
  if (error) throw error
}

export async function setWorldEntryRevealed(id: string, revealed: boolean) {
  const { error } = await supabase.rpc("set_world_entry_revealed", {
    target_entry: id,
    is_revealed: revealed,
  })
  if (error) throw error
}

export async function deleteWorldEntry(id: string) {
  const { error } = await supabase.rpc("delete_world_entry", {
    target_entry: id,
  })
  if (error) throw error
}
