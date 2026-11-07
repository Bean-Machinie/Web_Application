import { useEffect, useMemo, useState } from "react"
import { fetchJournalTree } from "@/lib/journal"
import type { JournalNode } from "@/lib/journal"
import type { TextEntry } from "@/lib/palette-deep"
import { fetchLibraryEntries, fetchWorldEntries } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { fetchLibrarySearchText, fetchSearchText, matchesQuery } from "@/lib/world-search"
import type { SearchText } from "@/lib/world-search"

type Source = { entries: WorldEntry[]; text: SearchText; campaignId: string | null; campaignName: string | null }
type Loaded = { pages: JournalNode[]; sources: Source[] }

const MIN_CHARS = 2
const PER_SOURCE = 12

const library = async (): Promise<Source> => ({ entries: await fetchLibraryEntries(), text: await fetchLibrarySearchText(), campaignId: null, campaignName: null })
const campaign = async (id: string, name: string): Promise<Source> => ({ entries: await fetchWorldEntries(id), text: await fetchSearchText(id), campaignId: id, campaignName: name })

// What the palette searches beyond names, read once when something is first typed after it opens:
// the open campaign's journal pages and entries' text, and the library's. A source that fails to
// load is left out, so the rest still search.
export function usePaletteDeep(open: boolean, query: string, current: { id: string; name: string } | null) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const wanted = open && query.trim().length >= MIN_CHARS
  const currentId = current?.id
  const currentName = current?.name

  useEffect(() => {
    if (!open) setLoaded(null)
  }, [open])

  useEffect(() => {
    if (!wanted || loaded) return
    let live = true
    const tasks = [library(), ...(currentId ? [campaign(currentId, currentName ?? "")] : [])]
    Promise.allSettled([currentId ? fetchJournalTree(currentId) : Promise.resolve([]), ...tasks]).then(([pages, ...sources]) => {
      if (!live) return
      setLoaded({
        pages: pages.status === "fulfilled" ? (pages.value as JournalNode[]) : [],
        sources: sources.flatMap((result) => (result.status === "fulfilled" ? [result.value as Source] : [])),
      })
    })
    return () => {
      live = false
    }
  }, [wanted, loaded, currentId, currentName])

  const textEntries = useMemo<TextEntry[]>(() => {
    if (!wanted || !loaded) return []
    return loaded.sources.flatMap((source) =>
      source.entries
        .filter((entry) => matchesQuery(entry, query, source.text))
        .slice(0, PER_SOURCE)
        .map((entry) => ({ entry, campaignId: source.campaignId, campaignName: source.campaignName }))
    )
  }, [wanted, loaded, query])

  return { pages: wanted && loaded ? loaded.pages : [], textEntries }
}
