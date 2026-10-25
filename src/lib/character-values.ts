import type { SheetFieldType } from "./character-templates/types"

// The shapes of what is stored, by type. The database only keeps them as JSON.
export type ResourceValue = { current: number; max: number }
export type TrackValue = { filled: number }
export type ListItem = { id: string; text: string }

// An attack: the ability it uses picks the modifier its to-hit is worked out from, plus the
// proficiency bonus when proficient, unless the player entered a to-hit of their own.
export type Attack = {
  id: string
  name: string
  ability: string | null
  proficient: boolean
  toHit: number | null
  damage: string
  // Put there by the builder from the starting equipment: the ability modifier is added to
  // its damage, which the sheet shows.
  auto?: boolean
}

export const DEFAULT_TRACK_LENGTH = 3

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)

export const readStat = (value: unknown) => (isNumber(value) ? value : null)

// A resource whose maximum is calculated stores only the current value, so a missing
// maximum reads as 0.
export function readResource(value: unknown): ResourceValue | null {
  const resource = value as Partial<ResourceValue> | null
  return isNumber(resource?.current) ? { current: resource.current, max: isNumber(resource.max) ? resource.max : 0 } : null
}

export const readTrack = (value: unknown, length: number) =>
  Math.min(Math.max(isNumber((value as TrackValue | null)?.filled) ? (value as TrackValue).filled : 0, 0), length)

export const readList = (value: unknown): ListItem[] =>
  Array.isArray(value)
    ? value.filter((item): item is ListItem => typeof item?.id === "string" && typeof item.text === "string")
    : []

export const readPicks = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []

export const readChoice = (value: unknown) => (typeof value === "string" && value !== "" ? value : null)

export const readAttacks = (value: unknown): Attack[] =>
  Array.isArray(value)
    ? value
        .filter((item) => typeof item?.id === "string")
        .map((item) => ({
          id: item.id as string,
          name: typeof item.name === "string" ? item.name : "",
          ability: readChoice(item.ability),
          proficient: item.proficient !== false,
          toHit: readStat(item.toHit),
          damage: typeof item.damage === "string" ? item.damage : "",
          auto: item.auto === true,
        }))
    : []

// Whether a field holds nothing yet.
export function isEmptyValue(type: SheetFieldType, value: unknown) {
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
    case "toggle":
      return value !== true
    case "line":
      return readLine(value) === ""
    case "choice":
      return readChoice(value) === null
    case "attacks":
      return readAttacks(value).length === 0
    case "picks":
      return readPicks(value).length === 0
  }
}

export const readLine = (value: unknown) => (typeof value === "string" ? value : "")

// A number typed by hand: whole, or nothing.
export function toWhole(text: string) {
  const number = Number(text)
  return text.trim() === "" || !Number.isFinite(number) ? null : Math.round(number)
}

// What a pill in the header says for a field.
export function pillValue(type: SheetFieldType, value: unknown, length: number) {
  if (type === "toggle") return value === true ? "On" : "Off"
  if (type === "line") return readLine(value) || "—"
  if (type === "choice") return readChoice(value) ?? "—"
  if (type === "stat") return readStat(value)?.toString() ?? "—"
  if (type === "resource") {
    const resource = readResource(value)
    return resource ? `${resource.current}/${resource.max}` : "—"
  }
  return `${readTrack(value, length)}/${length}`
}

// A resource with a calculated maximum as its control shows it: the stored current value
// with the maximum worked out (or the player's own). Empty while neither is known.
export function shownResource(stored: unknown, max: number | null): ResourceValue | null {
  const current = readResource(stored)?.current
  return current === undefined && max === null ? null : { current: current ?? 0, max: max ?? 0 }
}

// What a change to that control stores: the current value, and the maximum only when the
// player changed it, which then stands in for the calculated one.
export function splitResource(next: ResourceValue, max: number | null) {
  return { stored: { current: next.current }, max: next.max === (max ?? 0) ? null : next.max }
}
