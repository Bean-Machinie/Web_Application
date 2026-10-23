import type { CharacterFieldType } from "./character-templates/types"

// The shapes of what is stored, by type. The database only keeps them as JSON.
export type ResourceValue = { current: number; max: number }
export type TrackValue = { filled: number }
export type ListItem = { id: string; text: string }

export const DEFAULT_TRACK_LENGTH = 3

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)

export const readStat = (value: unknown) => (isNumber(value) ? value : null)

export function readResource(value: unknown): ResourceValue | null {
  const resource = value as Partial<ResourceValue> | null
  return isNumber(resource?.current) && isNumber(resource?.max)
    ? { current: resource.current, max: resource.max }
    : null
}

export const readTrack = (value: unknown, length: number) =>
  Math.min(Math.max(isNumber((value as TrackValue | null)?.filled) ? (value as TrackValue).filled : 0, 0), length)

export const readList = (value: unknown): ListItem[] =>
  Array.isArray(value)
    ? value.filter((item): item is ListItem => typeof item?.id === "string" && typeof item.text === "string")
    : []

// Whether a field holds nothing yet.
export function isEmptyValue(type: CharacterFieldType, value: unknown) {
  switch (type) {
    case "stat":
      return readStat(value) === null
    case "resource":
      return readResource(value) === null
    case "track":
      return readTrack(value, Infinity) === 0
    case "list":
      return readList(value).length === 0
    case "text":
      return value == null
  }
}

// A number typed by hand: whole, or nothing.
export function toWhole(text: string) {
  const number = Number(text)
  return text.trim() === "" || !Number.isFinite(number) ? null : Math.round(number)
}

// What a pill in the header says for a field.
export function pillValue(type: CharacterFieldType, value: unknown, length: number) {
  if (type === "stat") return readStat(value)?.toString() ?? "—"
  if (type === "resource") {
    const resource = readResource(value)
    return resource ? `${resource.current}/${resource.max}` : "—"
  }
  return `${readTrack(value, length)}/${length}`
}
