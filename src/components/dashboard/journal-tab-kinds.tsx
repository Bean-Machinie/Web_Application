import type { ComponentType } from "react"
import { File, FileText } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { JournalTreeState } from "@/hooks/use-journal-tree"
import { campaignPath } from "@/lib/campaign-paths"
import { fetchJournalContent } from "@/lib/journal"
import { previewLines } from "@/lib/journal-preview"
import type { TabPreview } from "@/lib/journal-preview"
import { fetchWorldFields } from "@/lib/world-fields"
import { toWorldImage } from "@/lib/world-images"
import type { JournalNode } from "@/lib/journal"
import { tabKey } from "@/lib/journal-workspace"
import type { Tab } from "@/lib/journal-workspace"
import type { WorldEntry } from "@/lib/world-entries"
import { COVER_FIELD, WORLD_KINDS } from "@/lib/world-kinds"
import { JournalEntryTab } from "./JournalEntryTab"
import { JournalPageTab } from "./JournalPageTab"

export type TabLabel = { title: string; icon: LucideIcon }

// What a kind needs to know about the campaign to name its tabs and to tell whether
// what they show is still there.
export type TabContext = {
  campaignId: string
  nodes: JournalNode[] | null
  entries: WorldEntry[] | null
}

export type TabContentProps = { id: string; tree: JournalTreeState; canManage: boolean }

type TabKind = {
  describe: (id: string, ctx: TabContext) => TabLabel
  // Null while that is not known yet (still loading).
  exists: (id: string, ctx: TabContext) => boolean | null
  Content: ComponentType<TabContentProps>
  // How to take a small look at it without opening it, for a tab carried while another shows.
  loadPreview?: (id: string, ctx: TabContext) => Promise<TabPreview> | null
  // Where the same thing has a page of its own, outside the journal; null if it has none.
  fullPageHref: (campaignId: string, id: string) => string | null
}

export async function loadPagePreview(id: string): Promise<TabPreview> {
  const page = await fetchJournalContent(id)
  return { image: null, lines: previewLines(page?.content) }
}

// The cover, the facts the entry's kind puts in its card, then what its text says.
async function loadEntryPreview(entry: WorldEntry): Promise<TabPreview> {
  const fields = await fetchWorldFields(entry.id)
  const kind = WORLD_KINDS[entry.kind]
  const facts = (kind.previewFacts ?? []).flatMap((key) => {
    const field = kind.fields.find((candidate) => candidate.key === key)
    const raw = fields[key]?.value
    if (!field || typeof raw !== "string" || !raw) return []
    const shown = field.options?.find((option) => option.value === raw)?.label ?? raw
    return [{ text: `${field.label}: ${shown}`, heading: false }]
  })
  const prose = kind.fields.filter((field) => field.type === "rich_text").flatMap((field) => previewLines(fields[field.key]?.value))
  return { image: toWorldImage(fields[COVER_FIELD]?.value)?.url ?? null, lines: [...facts, ...prose].slice(0, 12) }
}

// A new kind of tab, a map say, is one more entry here: nothing else in the journal
// asks what kinds there are.
export const TAB_KINDS: Record<string, TabKind> = {
  page: {
    describe: (id, { nodes }) => ({
      title: nodes?.find((node) => node.id === id)?.title || "Untitled",
      icon: FileText,
    }),
    exists: (id, { nodes }) => nodes && nodes.some((node) => node.id === id),
    Content: JournalPageTab,
    loadPreview: (id) => loadPagePreview(id),
    // A page lives in the journal and nowhere else.
    fullPageHref: () => null,
  },
  entry: {
    describe: (id, { entries }) => {
      const entry = entries?.find((candidate) => candidate.id === id)
      return entry ? { title: entry.name, icon: WORLD_KINDS[entry.kind].icon } : { title: "Entry", icon: File }
    },
    exists: (id, { entries }) => entries && entries.some((entry) => entry.id === id),
    Content: JournalEntryTab,
    loadPreview: (id, { entries }) => {
      const entry = entries?.find((candidate) => candidate.id === id)
      return entry ? loadEntryPreview(entry) : null
    },
    fullPageHref: (campaignId, id) => campaignPath(campaignId, `world/${id}`),
  },
}

export const describeTab = (ctx: TabContext, tab: Tab): TabLabel =>
  TAB_KINDS[tab.kind]?.describe(tab.id, ctx) ?? { title: "Unknown", icon: File }

// Null while it is not known yet: the journal has only just opened and what the tab
// shows is still loading, which is not the same as gone. A kind that is not
// registered has nothing to show, so its tabs do not exist.
export function tabExists(ctx: TabContext, tab: Tab): boolean | null {
  const kind = TAB_KINDS[tab.kind]
  return kind ? kind.exists(tab.id, ctx) : false
}

// The way to take a look at a tab; the key says which, so asking again for the same
// tab is not a new look.
export function tabPreview(ctx: TabContext, tab: Tab) {
  const kind = TAB_KINDS[tab.kind]
  if (!kind?.loadPreview) return undefined
  return { key: tabKey(tab), load: () => kind.loadPreview!(tab.id, ctx) }
}

export const tabFullPage = (ctx: TabContext, tab: Tab) =>
  TAB_KINDS[tab.kind]?.fullPageHref(ctx.campaignId, tab.id) ?? null
