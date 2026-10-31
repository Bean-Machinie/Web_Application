import { NONE } from "./character-format"

export const number = (value: number | null | undefined, unit = "") => (value === null || value === undefined ? NONE : `${value}${unit}`)

// Whether the committed card holds the same entry, so a value the preview adds can be highlighted.
export function has<T>(list: T[], item: T) {
  const text = JSON.stringify(item)
  return list.some((other) => JSON.stringify(other) === text)
}
