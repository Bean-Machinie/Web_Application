import { BookMarked, Box, FileText, LayoutGrid, Map as MapIcon, Skull } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { MONSTER_TYPES } from "./compendium-monsters"
import { RULE_CATEGORIES } from "./rules-terms"
import { SRD_LABEL } from "./srd-paths"
import { monsterTypeIcon } from "./srd-entries"
import type { WorldEntry } from "./world-entries"
import { WORLD_KINDS, worldKinds } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// What the library is organised by. A new section (assets, say) is one more entry here: the column beside the library, its
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

// The SRD is a source of its own beside the library: read only, and not entries, so its
// sections filter none (see srd-items). Creatures nest by type, rules by category.
export const SRD_SECTIONS: LibrarySection[] = [
  {
    id: "srd:creatures",
    label: "Creatures",
    icon: Skull,
    matches: () => false,
    makes: [],
    children: MONSTER_TYPES.map((type) => ({ id: `srd:creatures:${type}`, label: type, icon: monsterTypeIcon(type), matches: () => false, makes: [] })),
  },
  {
    id: "srd:rules",
    label: "Rules",
    icon: BookMarked,
    matches: () => false,
    makes: [],
    children: RULE_CATEGORIES.map((category) => ({ id: `srd:rules:${category.id}`, label: category.title, icon: FileText, matches: () => false, makes: [] })),
  },
]

export type LibraryGroup = { title: string; sections: LibrarySection[] }

// What the library's menu is organised by: only the person's own content.
export const LIBRARY_GROUPS: LibraryGroup[] = [{ title: "Yours", sections: LIBRARY_SECTIONS }]

// What the menu of the compendium is organised by: the SRD, creatures first and rules last.
export const COMPENDIUM_GROUPS: LibraryGroup[] = [
  { title: SRD_LABEL, sections: SRD_SECTIONS },
]

// In the window that adds to a campaign, the SRD creatures are one more section beside Mine's:
// the only part of the SRD that can become an entry.
export const SRD_PICK_SECTION: LibrarySection = {
  id: "srd:creatures",
  label: "SRD creatures",
  icon: Skull,
  matches: () => false,
  makes: [],
}

export const flatSections =LIBRARY_SECTIONS.flatMap((section) => [section, ...(section.children ?? [])])

export const findSection = (id: string) =>
  flatSections.find((section) => section.id === id) ?? LIBRARY_SECTIONS[0]

export const countIn = (section: LibrarySection, entries: WorldEntry[] | null) =>
  entries && entries.filter(section.matches).length

// The graph shows entries and what joins them; maps are not part of it.
export const hasGraph = (section: LibrarySection) => section.id === "world" || section.id.startsWith("world:")
