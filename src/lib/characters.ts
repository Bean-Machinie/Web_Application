import { deleteWorldImage, toWorldImage } from "./world-images"
import type { WorldImage } from "./world-images"
import { supabase } from "./supabase"
import type { CharacterFieldType, FieldConfig } from "./character-templates/types"

// What a new character is called until it is named.
export const UNTITLED_CHARACTER = "Untitled character"

export const characterPath = (id: string) => `/app/characters/${id}`

export type Character = {
  id: string
  name: string
  concept: string
  portrait: WorldImage | null
  templateId: string
  templateVersion: number
  updatedAt: string
}

// A field the player added.
export type CustomField = {
  id: string
  tab: string
  section: string | null
  type: CharacterFieldType
  label: string
  config: FieldConfig
  sortOrder: number
}

// What is stored under a field id: its value, and whether it is pinned to the header
// (null: as the template says).
export type StoredValue = { value: unknown; pinned: boolean | null }

const COLUMNS = "id, name, concept, portrait, template_id, template_version, updated_at"

function toCharacter(row: Record<string, unknown>): Character {
  return {
    id: row.id as string,
    name: row.name as string,
    concept: row.concept as string,
    portrait: toWorldImage(row.portrait),
    templateId: row.template_id as string,
    templateVersion: row.template_version as number,
    updatedAt: row.updated_at as string,
  }
}

function toCustomField(row: Record<string, unknown>): CustomField {
  return {
    id: row.id as string,
    tab: row.tab_id as string,
    section: row.section_id as string | null,
    type: row.type as CharacterFieldType,
    label: row.label as string,
    config: (row.config as FieldConfig) ?? {},
    sortOrder: row.sort_order as number,
  }
}

export async function fetchCharacters() {
  const { data, error } = await supabase.from("characters").select(COLUMNS).order("updated_at", { ascending: false })
  if (error) throw error
  return (data as Record<string, unknown>[]).map(toCharacter)
}

// Null when it does not exist or is not yours.
export async function fetchCharacter(id: string) {
  const { data, error } = await supabase.from("characters").select(COLUMNS).eq("id", id).maybeSingle()
  if (error) throw error
  return data ? toCharacter(data as Record<string, unknown>) : null
}

export async function fetchCharacterFields(id: string) {
  const { data, error } = await supabase
    .from("character_fields")
    .select("id, tab_id, section_id, type, label, config, sort_order")
    .eq("character_id", id)
    .order("sort_order")
  if (error) throw error
  return (data as Record<string, unknown>[]).map(toCustomField)
}

export async function fetchCharacterValues(id: string) {
  const { data, error } = await supabase
    .from("character_values")
    .select("field_id, value, pinned")
    .eq("character_id", id)
  if (error) throw error
  const values: Record<string, StoredValue> = {}
  for (const row of data as { field_id: string; value: unknown; pinned: boolean | null }[]) {
    values[row.field_id] = { value: row.value, pinned: row.pinned }
  }
  return values
}

async function call(name: string, args: Record<string, unknown>) {
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw error
  return data
}

export async function createCharacter(template: string, version: number, name: string) {
  const data = await call("create_character", { template, template_ver: version, character_name: name })
  return toCharacter(data as Record<string, unknown>)
}

export const renameCharacter = (id: string, name: string) =>
  call("rename_character", { target_character: id, new_name: name })

export const setCharacterConcept = (id: string, concept: string) =>
  call("set_character_concept", { target_character: id, new_concept: concept })

export const setCharacterPortrait = (id: string, portrait: WorldImage | null) =>
  call("set_character_portrait", { target_character: id, new_portrait: portrait })

// Also removes the portrait's file, as deleting an entry removes its image.
export async function deleteCharacter(id: string, portraitPath?: string | null) {
  await call("delete_character", { target_character: id })
  // The file is no longer referenced; failing to remove it is harmless.
  await deleteWorldImage(portraitPath).catch(() => {})
}

export async function addCharacterField(
  id: string,
  tab: string,
  type: CharacterFieldType,
  label: string,
  config: FieldConfig = {}
) {
  const data = await call("add_character_field", {
    target_character: id,
    field_tab: tab,
    field_section: null,
    field_type: type,
    field_label: label,
    field_config: config,
  })
  return toCustomField(data as Record<string, unknown>)
}

export const updateCharacterField = (fieldId: string, label: string, config: FieldConfig) =>
  call("update_character_field", { target_field: fieldId, new_label: label, new_config: config })

export const removeCharacterField = (fieldId: string) => call("remove_character_field", { target_field: fieldId })

export const setCharacterValue = (id: string, fieldId: string, value: unknown) =>
  call("set_character_value", { target_character: id, target_field: fieldId, new_value: value })

export const setCharacterPinned = (id: string, fieldId: string, pinned: boolean) =>
  call("set_character_pinned", { target_character: id, target_field: fieldId, is_pinned: pinned })
