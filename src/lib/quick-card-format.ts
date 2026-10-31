export const NONE = "—"
export const number = (value: number | null | undefined, unit = "") => (value === null || value === undefined ? NONE : `${value}${unit}`)
export const signed = (value: number | null | undefined) => (value === null || value === undefined ? NONE : value >= 0 ? `+${value}` : `−${-value}`)

// Whether the committed card holds the same entry, so a value the preview adds can be highlighted.
export function has<T>(list: T[], item: T) {
  const text = JSON.stringify(item)
  return list.some((other) => JSON.stringify(other) === text)
}
