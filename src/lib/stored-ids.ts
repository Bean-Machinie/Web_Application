// A set of ids kept as text in browser storage, such as the folded rows of a tree.
export function readIds(text: string | null): ReadonlySet<string> {
  try {
    const ids = JSON.parse(text ?? "[]") as unknown
    return new Set(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [])
  } catch {
    return new Set()
  }
}

export const writeIds = (ids: ReadonlySet<string>) => JSON.stringify([...ids])
