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

// Asks which of the linked entries to bring along, when there are any that are
// new: resolves to their ids (none, for "only what was picked"), or to null if
// the person backs out.
export type AskCopyChoice = (
  plan: Plan,
  target: CopyTarget,
  picked: number
) => Promise<string[] | null>

export type CopyOutcome = {
  cancelled: boolean
  // The ids of the picked entries that were copied.
  copiedIds: string[]
  // Entries copied only because something linked them.
  linked: number
  // Linked entries that were not brought along.
  leftOut: number
  // Why nothing was copied, naming the entry when it was one that failed.
  error: string | null
}

// What a scope offers to copy library entries into it.
export type AddFromLibrary = (items: CopyItem[], ask: AskCopyChoice) => Promise<CopyOutcome>

export const copiedCount = (outcome: CopyOutcome) => outcome.copiedIds.length + outcome.linked

const entries = (count: number) => `${count} linked ${count === 1 ? "entry" : "entries"}`

// What to add to "Saved … " when other entries were linked.
export function copyNote(outcome: CopyOutcome) {
  const parts = []
  if (outcome.linked > 0) parts.push(`${entries(outcome.linked)} came along.`)
  if (outcome.leftOut > 0) parts.push(`${outcome.leftOut} left out.`)
  return parts.join(" ")
}

const none: CopyOutcome = { cancelled: false, copiedIds: [], linked: 0, leftOut: 0, error: null }

// Copies the picked entries with what they link: the plan is read first, and if
// it holds linked entries the target does not have, the person chooses which
// come along. Everything goes in one transaction, so it all happens or none of
// it does. A link survives only if both its ends do.
export async function copyEntries(
  items: CopyItem[],
  target: CopyTarget,
  ask: AskCopyChoice
): Promise<CopyOutcome> {
  if (items.length > COPY_LIMIT) {
    return { ...none, error: `Pick at most ${COPY_LIMIT} entries at a time.` }
  }

  try {
    const plan = await fetchCopyPlan(
      items.map((item) => item.id),
      target.campaignId
    )
    const fresh = newEntries(plan).length

    let keep: string[] = []
    if (fresh > 0) {
      const answer = await ask(plan, target, items.length)
      if (!answer) return { ...none, cancelled: true }
      keep = answer
    }

    await copyEntriesWithLinks(
      items.map((item) => item.id),
      keep,
      target.folder,
      target.campaignId,
      plan
    )
    return {
      ...none,
      copiedIds: items.map((item) => item.id),
      linked: keep.length,
      leftOut: fresh - keep.length,
    }
  } catch (failure) {
    return { ...none, error: errorMessage(failure) }
  }
}
