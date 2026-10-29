import { useState } from "react"
import { cardOf } from "@/lib/quick-card"
import { nextEmpty, slotsOf } from "@/lib/quick-slots"
import { readRules } from "@/lib/quick-state"
import { readView, withPick } from "@/lib/quick-view"
import type { useCharacter } from "@/hooks/use-character"
import { commitPick } from "@/components/dashboard/quick-commit"
import type { SheetActions } from "@/components/dashboard/character-actions"

// The start page's state: the slots of the sentence, which strip is open, and the option being
// previewed. The card is worked out twice, with and without the preview, so it can show the
// difference.
export function useQuickBuild(sheet: ReturnType<typeof useCharacter>, actions: SheetActions) {
  const view = readView(actions)
  const rules = readRules(actions.values)
  const slots = slotsOf(view)
  const [openId, setOpenId] = useState<string | null>(() => nextEmpty(slots))
  const [preview, setPreview] = useState<{ slot: string; id: string } | null>(null)

  const base = cardOf(view, sheet.fields, actions.values, rules)
  const tried = preview ? cardOf(withPick(view, preview.slot, preview.id), sheet.fields, actions.values, rules) : base

  function choose(slot: string, id: string) {
    commitPick(actions, view, slot, id)
    setPreview(null)
    setOpenId(nextEmpty(slotsOf(withPick(view, slot, id))))
  }

  return {
    view,
    rules,
    slots,
    // A slot that has gone (a new species has no lineage) leaves nothing open.
    open: slots.find((slot) => slot.id === openId) ?? null,
    base,
    tried,
    toggle: (slot: string) => setOpenId((current) => (current === slot ? null : slot)),
    preview: (slot: string, id: string | null) => setPreview(id ? { slot, id } : null),
    choose,
  }
}
