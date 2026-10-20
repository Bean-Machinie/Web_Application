import { campaignPath } from "./campaign-paths"
import { roleLabel } from "./campaign-list"
import { can } from "./campaign-permissions"
import type { Campaign } from "./campaigns"
import { matchText } from "./palette-search"
import type { PaletteGroup, PaletteItem, Recent } from "./palette-items"
import type { WorldEntry } from "./world-entries"
import { libraryKinds } from "./world-scope"
import { WORLD_KINDS, worldKinds } from "./world-kinds"

export type PaletteInput = {
  query: string
  campaigns: Campaign[]
  // The campaign the address points at, or null on home and in the library.
  current: Campaign | null
  // Null while they load.
  campaignEntries: WorldEntry[] | null
  libraryEntries: WorldEntry[] | null
  recents: Recent[]
  // Where each page lives, with its icon: the campaign's pages and the main ones.
  campaignPages: { title: string; to: string; icon: string }[]
  mainPages: { title: string; to: string; icon: string }[]
}

const PER_GROUP = 8

const withRecent = (item: Omit<PaletteItem, "recent">): PaletteItem => ({
  ...item,
  recent: { key: item.id, name: item.name, path: item.path, context: item.context, visual: item.visual },
})

const entryItem = (entry: WorldEntry, context: string, path: string, matched: number[]) =>
  withRecent({
    id: `entry:${entry.id}`,
    name: entry.name,
    context,
    path,
    visual: { type: "entry", kind: entry.kind, imageUrl: entry.imageUrl },
    matched,
  })

// Keeps what matches the search, best first.
function best<T>(
  things: T[],
  query: string,
  text: (thing: T) => string,
  build: (thing: T, matched: number[]) => PaletteItem,
  extra: (thing: T) => string = () => ""
) {
  return things
    .map((thing) => ({ thing, hit: matchText(query, text(thing)) ?? matchText(query, extra(thing)) }))
    .filter((found) => found.hit)
    .sort((a, b) => b.hit!.score - a.hit!.score)
    .slice(0, PER_GROUP)
    .map(({ thing, hit }) =>
      build(thing, matchText(query, text(thing)) ? hit!.indices : [])
    )
}

function actions(input: PaletteInput): PaletteItem[] {
  const { current, query } = input
  const make = (name: string, path: string, words: string): PaletteItem | null =>
    matchText(query, name) || matchText(query, words)
      ? { id: `action:${name}`, name, context: "Action", path, visual: { type: "action" }, matched: matchText(query, name)?.indices ?? [] }
      : null

  const entries =
    current && can(current.role, "manage_world")
      ? worldKinds.map((kind) => ({ kind, base: campaignPath(current.id, "world") }))
      : current
        ? []
        : libraryKinds.map((kind) => ({ kind, base: "/app/library" }))

  return [
    make("New campaign", "/app/campaigns/new", "create campaign"),
    ...entries.map(({ kind, base }) =>
      make(`New ${WORLD_KINDS[kind].label.toLowerCase()}`, `${base}?create=${kind}`, `new entry ${WORLD_KINDS[kind].label}`)
    ),
  ].filter((item): item is PaletteItem => item !== null)
}

export function buildGroups(input: PaletteInput): PaletteGroup[] {
  const { query, campaigns, current, campaignEntries, libraryEntries } = input

  const pageItem = (page: { title: string; to: string; icon: string }, context: string, matched: number[]): PaletteItem => ({
    id: `page:${page.to}`,
    name: page.title,
    context,
    path: page.to,
    visual: { type: "page", icon: page.icon },
    matched,
  })

  if (!query.trim()) {
    const recent = input.recents.slice(0, 5).map((item): PaletteItem => ({
      id: item.key, name: item.name, context: item.context, path: item.path, visual: item.visual, matched: [], recent: item,
    }))
    const goTo = [
      ...(current ? input.campaignPages.map((page) => pageItem(page, current.name, [])) : []),
      ...input.mainPages.map((page) => pageItem(page, "App", [])),
    ]
    return [
      { heading: "Recent", items: recent },
      { heading: "Go to", items: goTo },
    ].filter((group) => group.items.length > 0)
  }

  const campaignItems = (list: Campaign[]) =>
    best(list, query, (campaign) => campaign.name, (campaign, matched) =>
      withRecent({
        id: `campaign:${campaign.id}`,
        name: campaign.name,
        context: roleLabel(campaign.role),
        path: campaignPath(campaign.id),
        visual: { type: "campaign", name: campaign.name, imageUrl: campaign.imageUrl },
        matched,
      })
    )

  const libraryItems = best(libraryEntries ?? [], query, (entry) => entry.name, (entry, matched) =>
    entryItem(entry, "Library", `/app/library/${entry.id}`, matched)
  )

  const groups: PaletteGroup[] = current
    ? [
        {
          heading: "World",
          items: best(campaignEntries ?? [], query, (entry) => entry.name, (entry, matched) =>
            entryItem(entry, current.name, `${campaignPath(current.id, "world")}/${entry.id}`, matched)
          ),
        },
        {
          heading: "Pages",
          items: best(input.campaignPages, query, (page) => page.title, (page, matched) =>
            pageItem(page, current.name, matched)
          ),
        },
        { heading: "Campaigns", items: campaignItems(campaigns.filter((campaign) => campaign.id !== current.id)) },
        { heading: "Library", items: libraryItems },
      ]
    : [
        { heading: "Campaigns", items: campaignItems(campaigns) },
        { heading: "Library", items: libraryItems },
      ]

  return [...groups, { heading: "Actions", items: actions(input) }].filter((group) => group.items.length > 0)
}
