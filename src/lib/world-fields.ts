import { supabase } from "@/lib/supabase"

// A new field type is one more value here and in the world_field_type enum,
// plus an entry in components/dashboard/field-types.tsx.
export type WorldFieldType = "rich_text" | "image" | "short_text" | "select"

// What the database holds for one field. A field with no row is empty.
export type StoredField = {
  value: unknown
  private: boolean
}

export async function fetchWorldFields(entryId: string) {
  // A function, not the table: it nulls the value of private fields for
  // players while still saying that they exist.
  const { data, error } = await supabase.rpc("get_world_entry_fields", {
    target_entry: entryId,
  })
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
  value: unknown,
  defaultPrivate: boolean
) {
  const { error } = await supabase.rpc("set_world_entry_field_value", {
    target_entry: entryId,
    field_key: key,
    field_type: type,
    field_value: value,
    default_private: defaultPrivate,
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
