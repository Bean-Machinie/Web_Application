import { supabase } from "@/lib/supabase"

// A new field type is one more value here and in the world_field_type enum,
// plus an entry in components/dashboard/field-types.tsx.
export type WorldFieldType = "rich_text" | "image"

// What the database holds for one field. A field with no row is empty.
export type StoredField = {
  value: unknown
  private: boolean
}

export async function fetchWorldFields(entryId: string) {
  const { data, error } = await supabase
    .from("world_entry_fields")
    .select("key, value, private")
    .eq("entry_id", entryId)
  if (error) throw error

  const fields: Record<string, StoredField> = {}
  for (const row of data as { key: string; value: unknown; private: boolean }[]) {
    fields[row.key] = { value: row.value, private: row.private }
  }
  return fields
}

export async function setWorldFieldValue(
  entryId: string,
  key: string,
  type: WorldFieldType,
  value: unknown
) {
  const { error } = await supabase.rpc("set_world_entry_field_value", {
    target_entry: entryId,
    field_key: key,
    field_type: type,
    field_value: value,
  })
  if (error) throw error
}

export async function setWorldFieldPrivate(
  entryId: string,
  key: string,
  type: WorldFieldType,
  isPrivate: boolean
) {
  const { error } = await supabase.rpc("set_world_entry_field_private", {
    target_entry: entryId,
    field_key: key,
    field_type: type,
    is_private: isPrivate,
  })
  if (error) throw error
}
