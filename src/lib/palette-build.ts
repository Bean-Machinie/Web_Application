import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { matchText } from "./palette-search"
import type { PaletteItem } from "./palette-items"
import type { WorldEntryKind } from "./world-kinds"

export type Page = { title: string; to: string; icon: AnimatedIconComponent }

// What is worth remembering as recently opened.
export const withRecent = (item: Omit<PaletteItem, "recent">): PaletteItem => ({
  ...item,
  recent: { key: item.id, name: item.name, path: item.path, context: item.context, visual: item.visual },
})

export const pageItem = (page: Page, context: string, matched: number[]): PaletteItem => ({
  id: `page:${page.to}`,
  name: page.title,
  context,
  path: page.to,
  visual: { type: "page", icon: page.icon },
  matched,
})

type EntryLike = { id: string; kind: WorldEntryKind; name: string; imageUrl: string | null }

export const entryItem = (entry: EntryLike, context: string, path: string, matched: number[]) =>
  withRecent({
    id: `entry:${entry.id}`,
    name: entry.name,
    context,
    path,
    visual: { type: "entry", kind: entry.kind, imageUrl: entry.imageUrl },
    matched,
  })

// Everything that matches the search, best first.
export function best<T>(
  things: T[],
  query: string,
  text: (thing: T) => string,
  build: (thing: T, matched: number[]) => PaletteItem
) {
  return things
    .map((thing) => ({ thing, hit: matchText(query, text(thing)) }))
    .filter((found) => found.hit)
    .sort((a, b) => b.hit!.score - a.hit!.score)
    .map(({ thing, hit }) => build(thing, hit!.indices))
}
