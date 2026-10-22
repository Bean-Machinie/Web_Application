import { errorMessage } from "./campaigns"
import { copyEntriesWithLinks } from "./world-copy-links"
import { fetchCopyPlan, newEntries } from "./world-copy-plan"
import type { Plan } from "./world-copy-plan"
import type { WorldEntryKind } from "./world-kinds"

// The database takes this many picked entries in one copy.
export const COPY_LIMIT = 200

export type CopyItem = { id: string; name: string; kind: WorldEntryKind }

// Where copies go: a campaign, or null for the person's library. The folder is
// the first folder of the copies' files.
export type CopyTarget = { campaignId: string | null; folder: string }

// The two questions a copy may ask. Each resolves to ids, or to null if the person
// backs out.
export type CopyAsker = {
  // Which of the linked entries the target does not have to bring along: their
  // ids (none, for "only what was picked").
  links: (plan: Plan, target: CopyTarget, picked: number) => Promise<string[] | null>
  // Which of the picked entries the target already has a copy of to copy again;
  // the others are skipped.
  duplicates: (entries: CopyItem[], target: CopyTarget, picked: number) => Promise<string[] | null>
}

export type CopyOutcome = {
  cancelled: boolean
  // The ids of the picked entries that were copied.
  copiedIds: string[]
  // The id of the copy, by the id of the entry it was copied from.
  newIds: Record<string, string>
  // Entries copied only because something linked them.
  linked: number
  // Linked entries that were not brought along.
  leftOut: number
  // Picked entries skipped because the target already had a copy.
  skipped: number
  // The maps the target already had that got a pin for a copied entry.
  pinnedOn: string[]
  // Why nothing was copied, naming the entry when it was one that failed.
  error: string | null
}

// What a scope offers to copy library entries into it.
export type AddFromLibrary = (items: CopyItem[], ask: CopyAsker) => Promise<CopyOutcome>

export const copiedCount = (outcome: CopyOutcome) => outcome.copiedIds.length + outcome.linked

const entries = (count: number) => `${count} linked ${count === 1 ? "entry" : "entries"}`

// What to add to "Saved … " when other entries were linked or some were skipped.
export function copyNote(outcome: CopyOutcome) {
  const parts = []
  if (outcome.linked > 0) parts.push(`${entries(outcome.linked)} came along.`)
  if (outcome.pinnedOn.length === 1) parts.push(`Pinned on ${outcome.pinnedOn[0]}.`)
  if (outcome.pinnedOn.length > 1) parts.push(`Pinned on ${outcome.pinnedOn.length} maps.`)
  if (outcome.leftOut > 0) parts.push(`${outcome.leftOut} left out.`)
  if (outcome.skipped > 0) parts.push(`${outcome.skipped} skipped, already there.`)
  return parts.join(" ")
}

const none: CopyOutcome = {
  cancelled: false,
  copiedIds: [],
  newIds: {},
  linked: 0,
  leftOut: 0,
  skipped: 0,
  pinnedOn: [],
  error: null,
}

// Copies the picked entries with what they link. The plan is read first. If the
// target already has a copy of some picked entries the person is asked whether to
// add another, and the ones they skip are left out. If what is left links to
// entries the target does not have, they choose which come along. Everything goes
// in one transaction, so it all happens or none of it does. A link survives only if
// both its ends do.
export async function copyEntries(
  items: CopyItem[],
  target: CopyTarget,
  ask: CopyAsker
): Promise<CopyOutcome> {
  if (items.length > COPY_LIMIT) {
    return { ...none, error: `Pick at most ${COPY_LIMIT} entries at a time.` }
  }

  try {
    let picked = items
    let plan = await fetchCopyPlan(
      picked.map((item) => item.id),
      target.campaignId
    )

    const duplicates = items.filter((item) =>
      plan.nodes.some((node) => node.isRoot && node.sourceId === item.id && node.copyHere)
    )
    let skipped = 0
    if (duplicates.length > 0) {
      const again = await ask.duplicates(duplicates, target, items.length)
      if (!again) return { ...none, cancelled: true }

      const skip = new Set(duplicates.filter((item) => !again.includes(item.id)).map((item) => item.id))
      skipped = skip.size
      picked = items.filter((item) => !skip.has(item.id))
      // Nothing left to copy is the same as backing out.
      if (picked.length === 0) return { ...none, cancelled: true }
      // What the skipped entries link no longer comes into it.
      if (skipped > 0) {
        plan = await fetchCopyPlan(
          picked.map((item) => item.id),
          target.campaignId
        )
      }
    }

    const fresh = newEntries(plan).length
    let keep: string[] = []
    if (fresh > 0) {
      const answer = await ask.links(plan, target, picked.length)
      if (!answer) return { ...none, cancelled: true }
      keep = answer
    }

    const { pinnedOn, newIds } = await copyEntriesWithLinks(
      picked.map((item) => item.id),
      keep,
      target.folder,
      target.campaignId,
      plan
    )
    return {
      ...none,
      copiedIds: picked.map((item) => item.id),
      newIds,
      linked: keep.length,
      leftOut: fresh - keep.length,
      skipped,
      pinnedOn,
    }
  } catch (failure) {
    return { ...none, error: errorMessage(failure) }
  }
}
