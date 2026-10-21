import type { EntryLink, LinkedEntry } from "./world-connections"
import { WORLD_KINDS } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// One row of the connections section: an entry, once, however many links join
// it to this one.
export type ConnectionRow = {
  entry: LinkedEntry
  // Where the mentions are, "In Description, Secrets"; null for pins.
  note: string | null
  // How many pins, so a map pinned twice is one row marked ×2.
  pinCount: number
  // The first link, which a row opens: for "On maps", the pin to frame.
  first: EntryLink
}

export type ConnectionGroupKey = "mentions" | "mentionedIn" | "onMaps" | "pins"

export type Connections = {
  groups: Record<ConnectionGroupKey, ConnectionRow[]>
  // Entries connected in any way, each counted once.
  total: number
}

export const GROUP_TITLES: Record<ConnectionGroupKey, string> = {
  mentions: "Mentions",
  mentionedIn: "Mentioned in",
  onMaps: "On maps",
  pins: "Pins",
}

export const GROUP_ORDER: ConnectionGroupKey[] = ["mentions", "mentionedIn", "onMaps", "pins"]

const fieldLabel = (kind: WorldEntryKind, key: string) =>
  WORLD_KINDS[kind].fields.find((field) => field.key === key)?.label ?? key

// The links of one kind in one direction, merged by the entry on the other end.
function rows(
  links: EntryLink[],
  otherOf: (link: EntryLink) => string,
  entries: Map<string, LinkedEntry>,
  labelOf?: (link: EntryLink, entry: LinkedEntry) => string
) {
  const merged = new Map<string, ConnectionRow & { labels: string[] }>()

  for (const link of links) {
    const entry = entries.get(otherOf(link))
    if (!entry) continue
    const row = merged.get(entry.id) ?? { entry, note: null, pinCount: 0, first: link, labels: [] }
    merged.set(entry.id, row)

    if (link.type === "pin") row.pinCount += 1
    const label = labelOf?.(link, entry)
    if (label && !row.labels.includes(label)) row.labels.push(label)
  }

  return [...merged.values()]
    .map(({ labels, ...row }) => ({ ...row, note: labels.length > 0 ? `In ${labels.join(", ")}` : null }))
    .sort((a, b) => a.entry.name.localeCompare(b.entry.name))
}

// Sorts the links of an entry into the four relationships.
export function groupConnections(
  entryId: string,
  kind: WorldEntryKind,
  links: EntryLink[],
  entries: Map<string, LinkedEntry>
): Connections {
  const mentions = links.filter((link) => link.type === "mention")
  const pins = links.filter((link) => link.type === "pin")

  const groups: Connections["groups"] = {
    mentions: rows(
      mentions.filter((link) => link.sourceId === entryId),
      (link) => link.targetId,
      entries,
      (link) => (link.fieldKey ? fieldLabel(kind, link.fieldKey) : "")
    ),
    // The field belongs to the entry that mentions, so its own kind names it.
    mentionedIn: rows(
      mentions.filter((link) => link.targetId === entryId),
      (link) => link.sourceId,
      entries,
      (link, entry) => (link.fieldKey ? fieldLabel(entry.kind, link.fieldKey) : "")
    ),
    onMaps: rows(
      pins.filter((link) => link.targetId === entryId),
      (link) => link.sourceId,
      entries
    ),
    pins: rows(
      pins.filter((link) => link.sourceId === entryId),
      (link) => link.targetId,
      entries
    ),
  }

  const connected = new Set(GROUP_ORDER.flatMap((key) => groups[key].map((row) => row.entry.id)))
  return { groups, total: connected.size }
}
