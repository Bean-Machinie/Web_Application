import { reconcile } from "./character-rules"
import type { RuleChange, RuleState } from "./character-rules"
import type { StoredValue } from "./characters"
import { withPick } from "./quick-view"
import type { QuickView } from "./quick-view"

// The stored values with an option tried on: what choosing it in a slot of the sentence would
// change, worked out by the same rules as choosing it. Nothing is stored.
export function tried(values: Record<string, StoredValue>, state: RuleState, view: QuickView, slot: string, id: string) {
  const changes: Record<string, RuleChange> = {
    class: { cls: id },
    species: { species: id },
    background: { background: id },
    lineage: { lineage: id },
    approach: { approach: id },
  }
  const set = changes[slot] ? reconcile(state, changes[slot]).set : slot === "size" ? { size: id } : { languages: withPick(view, slot, id).languages }
  return overlay(values, set)
}

// The stored values with a pick from a panel tried on, and what it would change in turn.
export const triedPick = (values: Record<string, StoredValue>, state: RuleState, picked: Record<string, unknown>) =>
  overlay(values, { ...reconcile(state, { pick: { values: picked } }).set, ...picked })

function overlay(values: Record<string, StoredValue>, set: Record<string, unknown>) {
  const next = { ...values }
  for (const [field, value] of Object.entries(set)) next[field] = { pinned: values[field]?.pinned ?? null, value }
  return next
}
