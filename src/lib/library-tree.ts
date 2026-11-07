import { LIBRARY_GROUPS, COMPENDIUM_GROUPS } from "./library-sections"
import type { LibrarySection } from "./library-sections"

export type LibraryRow = { section: LibrarySection; depth: number }

// The sections as the rows of a tree, in order, leaving out what is inside a folded one.
export function libraryRows(sections: LibrarySection[], collapsed: ReadonlySet<string>): LibraryRow[] {
  const rows: LibraryRow[] = []
  const walk = (list: LibrarySection[], depth: number) => {
    for (const section of list) {
      rows.push({ section, depth })
      if (section.children && !collapsed.has(section.id)) walk(section.children, depth + 1)
    }
  }
  walk(sections, 0)
  return rows
}

// What a node is called, for the search that is scoped to it.
export const nodeLabel = (id: string) =>
  libraryRows([...LIBRARY_GROUPS, ...COMPENDIUM_GROUPS].flatMap((group) => group.sections), new Set()).find((row) => row.section.id === id)?.section.label ?? "library"
