import { Box, LayoutGrid, Map as MapIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { WorldEntry } from "./world-entries"
import { WORLD_KINDS, worldKinds } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// What the library is organised by. A new section (the person's own player
// characters, assets) is one more entry here: the column beside the library, its
// counts and the filtering read this and need no other change. A section may nest
// others; an entry belongs to one of the deepest.
export type LibrarySection = {
  id: string
  label: string
  icon: LucideIcon
  matches: (entry: WorldEntry) => boolean
  // What "New" makes while this section is open; one kind makes it straight away.
  makes: WorldEntryKind[]
  children?: LibrarySection[]
}

const worldEntryKinds = worldKinds.filter((kind) => kind !== "map")

export const LIBRARY_SECTIONS: LibrarySection[] = [
  { id: "all", label: "All", icon: LayoutGrid, matches: () => true, makes: worldKinds },
  { id: "maps", label: "Maps", icon: MapIcon, matches: (entry) => entry.kind === "map", makes: ["map"] },
  {
    id: "world",
    label: "World entries",
    icon: Box,
    matches: (entry) => entry.kind !== "map",
    makes: worldEntryKinds,
    children: worldEntryKinds.map((kind) => ({
      id: `world:${kind}`,
      label: WORLD_KINDS[kind].plural,
      icon: WORLD_KINDS[kind].icon,
      matches: (entry: WorldEntry) => entry.kind === kind,
      makes: [kind],
    })),
  },
]

export const flatSections = LIBRARY_SECTIONS.flatMap((section) => [section, ...(section.children ?? [])])

export const findSection = (id: string) =>
  flatSections.find((section) => section.id === id) ?? LIBRARY_SECTIONS[0]

export const countIn = (section: LibrarySection, entries: WorldEntry[] | null) =>
  entries && entries.filter(section.matches).length

// The graph shows entries and what joins them; maps are not part of it.
export const hasGraph = (section: LibrarySection) => section.id === "world" || section.id.startsWith("world:")
