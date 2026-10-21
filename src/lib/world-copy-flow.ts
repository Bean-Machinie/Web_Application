import { copyEntry } from "./world-copy"
import { fetchCopyPlan } from "./world-copy-plan"
import type { PlanRow } from "./world-copy-plan"
import { copyMapsWithPins } from "./world-copy-pins"
import { errorMessage } from "./campaigns"
import type { WorldEntryKind } from "./world-kinds"

export type CopyItem = { id: string; name: string; kind: WorldEntryKind }

// Where copies go: a campaign, or null for the person's library. The folder is
// the first folder of the copies' files.
export type CopyTarget = { campaignId: string | null; folder: string }

export type CopyChoice = "pins" | "map-only"

// Asks the person what to do with the pins of the maps picked. Resolves to
// null if they back out.
export type AskCopyChoice = (plan: PlanRow[], target: CopyTarget) => Promise<CopyChoice | null>

export type CopyOutcome = {
  cancelled: boolean
  // The ids of the picked entries that were copied.
  copiedIds: string[]
  // Entries copied only because a pin linked them.
  linked: number
  pins: "none" | "copied" | "dropped"
  failed: { name: string; message: string }[]
}

// What a scope offers to copy library entries into it.
export type AddFromLibrary = (items: CopyItem[], ask: AskCopyChoice, onProgress?: (done: number, total: number) => void) => Promise<CopyOutcome>

export const copiedCount =(outcome: CopyOutcome) => outcome.copiedIds.length + outcome.linked

// What to add to "Saved … " when pins were involved.
export function copyNote(outcome: CopyOutcome) {
  if (outcome.pins === "dropped") return "Pins weren't copied."
  if (outcome.pins === "copied") {
    return outcome.linked > 0
      ? `Pins and ${outcome.linked} linked ${outcome.linked === 1 ? "entry" : "entries"} came along.`
      : "Pins came along."
  }
  return ""
}

// Copies the picked entries. Maps that have pins ask once, for all of them, what
// to do with the pins. Maps copied with their pins go together in one
// transaction, along with what their pins link; an entry that comes along that
// way is not copied a second time if it was picked too. The rest are copied one
// by one, and one that fails does not stop the others.
export async function copyEntries(
  items: CopyItem[],
  target: CopyTarget,
  ask: AskCopyChoice,
  onProgress?: (done: number, total: number) => void
): Promise<CopyOutcome> {
  const outcome: CopyOutcome = { cancelled: false, copiedIds: [], linked: 0, pins: "none", failed: [] }
  const maps = items.filter((item) => item.kind === "map")
  const plan = maps.length > 0 ? await fetchCopyPlan(maps.map((map) => map.id), target.campaignId) : []
  const pinned = plan.some((row) => row.isRoot && row.pinCount > 0)

  let choice: CopyChoice = "map-only"
  if (pinned) {
    const answer = await ask(plan, target)
    if (!answer) return { ...outcome, cancelled: true }
    choice = answer
  }

  const withPins = pinned && choice === "pins"
  outcome.pins = pinned ? (withPins ? "copied" : "dropped") : "none"
  const together = new Set<string>()

  if (withPins) {
    onProgress?.(0, items.length)
    try {
      const created = await copyMapsWithPins(
        maps.map((map) => map.id),
        target.folder,
        target.campaignId,
        plan
      )
      for (const sourceId of created.keys()) together.add(sourceId)
      outcome.copiedIds.push(...maps.map((map) => map.id))
      outcome.linked = created.size - maps.length
    } catch (failure) {
      outcome.pins = "none"
      outcome.failed.push({ name: "the maps", message: errorMessage(failure) })
    }
  }

  const rest = items.filter((item) => !together.has(item.id) && !(withPins && item.kind === "map"))
  for (const [index, item] of rest.entries()) {
    onProgress?.(index, rest.length)
    try {
      await copyEntry(item.id, target.folder, target.campaignId)
      outcome.copiedIds.push(item.id)
    } catch (failure) {
      outcome.failed.push({ name: item.name, message: errorMessage(failure) })
    }
  }

  // A picked entry that was copied only because a pin linked it counts once,
  // as linked, and is not in copiedIds.
  const picked = new Set(items.map((item) => item.id))
  for (const id of together) {
    if (picked.has(id) && !outcome.copiedIds.includes(id)) {
      outcome.copiedIds.push(id)
      outcome.linked -= 1
    }
  }

  return outcome
}
