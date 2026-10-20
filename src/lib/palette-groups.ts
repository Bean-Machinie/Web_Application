import { campaignPath } from "./campaign-paths"
import { roleLabel } from "./campaign-list"
import { can } from "./campaign-permissions"
import type { Campaign } from "./campaigns"
import { matchText } from "./palette-search"
import type { PaletteGroup, PaletteItem, Recent } from "./palette-items"
import type { SearchHit } from "./search-entries"
import type { WorldEntryKind } from "./world-kinds"
import { libraryKinds } from "./world-scope"
import { WORLD_KINDS, worldKinds } from "./world-kinds"

// Where the palette looks when something is typed.
export type PaletteScope = "everywhere" | "campaign" | "campaigns" | "library"

type Page = { title: string; to: string; icon: string }

export type PaletteInput = {
  query: string
  scope: PaletteScope
  campaigns: Campaign[]
  // The campaign the address points at, or null on home and in the library.
  current: Campaign | null
  // What the database found by name, in its own order.
  hits: SearchHit[]
  recents: Recent[]
  campaignPages: Page[]
  mainPages: Page[]
}

const withRecent = (item: Omit<PaletteItem, "recent">): PaletteItem => ({
  ...item,
  recent: { key: item.id, name: item.name, path: item.path, context: item.context, visual: item.visual },
})

const pageItem = (page: Page, context: string, matched: number[]): PaletteItem => ({
  id: `page:${page.to}`,
  name: page.title,
  context,
  path: page.to,
  visual: { type: "page", icon: page.icon },
  matched,
})

type EntryLike = { id: string; kind: WorldEntryKind; name: string; imageUrl: string | null }

const entryItem = (entry: EntryLike, context: string, path: string, matched: number[]) =>
  withRecent({
    id: `entry:${entry.id}`,
    name: entry.name,
    context,
    path,
    visual: { type: "entry", kind: entry.kind, imageUrl: entry.imageUrl },
    matched,
  })

// Everything that matches the search, best first.
function best<T>(
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

// "New ..." actions, offered only where they make sense for the scope.
function actions({ query, scope, current }: PaletteInput): PaletteItem[] {
  const make = (name: string, path: string, words: string): PaletteItem | null => {
    const hit = matchText(query, name)
    if (!hit && !matchText(query, words)) return null
    return { id: `action:${name}`, name, context: "Action", path, visual: { type: "action" }, matched: hit?.indices ?? [] }
  }
  const newEntry = (kinds: typeof worldKinds, base: string) =>
    kinds.map((kind) =>
      make(`New ${WORLD_KINDS[kind].label.toLowerCase()}`, `${base}?create=${kind}`, `new entry ${WORLD_KINDS[kind].label}`)
    )
  const inCampaign = current && can(current.role, "manage_world") ? newEntry(worldKinds, campaignPath(current.id, "world")) : []
  const inLibrary = newEntry(libraryKinds, "/app/library")
  const campaign = make("New campaign", "/app/campaigns/new", "create campaign")

  const chosen =
    scope === "campaign" ? inCampaign
    : scope === "campaigns" ? [campaign]
    : scope === "library" ? inLibrary
    : [campaign, ...(current ? inCampaign : inLibrary)]
  return chosen.filter((item): item is PaletteItem => item !== null)
}

// What shows with nothing typed: what was opened lately, and the main pages.
function startingGroups(input: PaletteInput): PaletteGroup[] {
  const recent = input.recents.slice(0, 5).map(
    (item): PaletteItem => ({ id: item.key, name: item.name, context: item.context, path: item.path, visual: item.visual, matched: [], recent: item })
  )
  const pages = [...(input.current ? input.campaignPages : []), ...input.mainPages].map((page) => pageItem(page, "", []))
  return [
    { heading: "Recent", items: recent },
    { heading: "Go to", items: pages },
  ].filter((group) => group.items.length > 0)
}

export function buildGroups(input: PaletteInput): PaletteGroup[] {
  const { query, scope, campaigns, current } = input
  if (!query.trim()) return startingGroups(input)

  const everywhere = scope === "everywhere"
  const groups: PaletteGroup[] = []

  // The database's order is its ranking, so hits are not sorted again; only
  // the letters to highlight are worked out here.
  const hitItems = (source: SearchHit["source"], context: (hit: SearchHit) => string): PaletteItem[] =>
    input.hits
      .filter((hit) => hit.source === source)
      .map((hit) =>
        entryItem(
          { id: hit.id, kind: hit.kind, name: hit.name, imageUrl: null },
          context(hit),
          hit.campaignId ? `${campaignPath(hit.campaignId, "world")}/${hit.id}` : `/app/library/${hit.id}`,
          matchText(query, hit.name)?.indices ?? []
        )
      )

  if (current && (scope === "campaign" || everywhere)) {
    groups.push(
      { heading: "World", items: hitItems("current", () => current.name) },
      {
        heading: "Pages",
        items: best(input.campaignPages, query, (page) => page.title, (page, matched) => pageItem(page, current.name, matched)),
      }
    )
  }

  if (everywhere) {
    groups.push({ heading: "Other campaigns", items: hitItems("other", (hit) => hit.campaignName ?? "") })
  } else if (scope === "campaigns") {
    // Entries in any of your campaigns, this one first.
    groups.push({
      heading: "Campaign entries",
      items: [...hitItems("current", (hit) => hit.campaignName ?? ""), ...hitItems("other", (hit) => hit.campaignName ?? "")],
    })
  }

  if (scope === "campaigns" || everywhere) {
    const shown = everywhere && current ? campaigns.filter((campaign) => campaign.id !== current.id) : campaigns
    groups.push({
      heading: "Campaigns",
      items: best(shown, query, (campaign) => campaign.name, (campaign, matched) =>
        withRecent({
          id: `campaign:${campaign.id}`,
          name: campaign.name,
          context: roleLabel(campaign.role),
          path: campaignPath(campaign.id),
          visual: { type: "campaign", name: campaign.name, imageUrl: campaign.imageUrl },
          matched,
        })
      ),
    })
  }

  if (scope === "library" || everywhere) {
    groups.push({ heading: "Library", items: hitItems("library", () => "Library") })
  }

  groups.push({ heading: "Actions", items: actions(input) })
  // A long group shows its first few results and offers the rest.
  return groups.filter((group) => group.items.length > 0).map((group) => ({ ...group, collapsible: true }))
}
