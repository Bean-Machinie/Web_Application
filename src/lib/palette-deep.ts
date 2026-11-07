import { BookOpenIcon } from "@/components/icons/BookOpenIcon"
import { campaignPath } from "./campaign-paths"
import type { JournalNode } from "./journal"
import { best, entryItem } from "./palette-build"
import type { PaletteGroup } from "./palette-items"
import { matchText } from "./palette-search"
import type { WorldEntry } from "./world-entries"

// An entry found by what is written in it, not by its name.
export type TextEntry = { entry: WorldEntry; campaignId: string | null; campaignName: string | null }

type Input = {
  query: string
  // The campaign the search is in, and whether it looks there, and in the library.
  current: { id: string; name: string } | null
  inCampaign: boolean
  inLibrary: boolean
  pages: JournalNode[]
  textEntries: TextEntry[]
  // Entries the database already found by name.
  found: Set<string>
}

// What the lists of the app find beyond a name: the journal's pages by title, and entries by the
// words in their fields, as the World and the library's own search does.
export function deepGroups({ query, current, inCampaign, inLibrary, pages, textEntries, found }: Input): PaletteGroup[] {
  const journal =
    current && inCampaign
      ? best(pages, query, (page) => page.title, (page, matched) => ({
          id: `journal:${page.id}`,
          name: page.title,
          context: `${current.name} · Journal`,
          path: campaignPath(current.id, `journal/${page.id}`),
          visual: { type: "page", icon: BookOpenIcon },
          matched,
        }))
      : []

  const mentioned = textEntries
    .filter(({ entry, campaignId }) => !found.has(entry.id) && (campaignId ? inCampaign : inLibrary))
    .map(({ entry, campaignId, campaignName }) =>
      entryItem(
        entry,
        campaignName ?? "Library",
        campaignId ? `${campaignPath(campaignId, "world")}/${entry.id}` : `/app/library/${entry.id}`,
        matchText(query, entry.name)?.indices ?? []
      )
    )

  return [
    { heading: "Journal", items: journal },
    { heading: "Mentioned in entries", items: mentioned },
  ]
}
