import { useState } from "react"
import { cardOf } from "@/lib/quick-card"
import { nextOpen, slotsOf } from "@/lib/quick-slots"
import { readRules } from "@/lib/quick-state"
import { readView, withPick } from "@/lib/quick-view"
import type { useCharacter } from "@/hooks/use-character"
import { commitPick } from "@/components/dashboard/quick-commit"
import type { SheetActions } from "@/components/dashboard/character-actions"

// The start page's state: the slots of the sentence, which one is open, and the option being
// previewed. The card is worked out twice, with and without the preview, so it can show the
// difference.
export function useQuickBuild(sheet: ReturnType<typeof useCharacter>, actions: SheetActions) {
  const view = readView(actions)
  const rules = readRules(actions.values)
  const slots = slotsOf(view)
  // The caret, the picker and the review all follow this one slot; the review shows when none.
  const next = nextOpen(slots)
  // A word the player clicked shows its picker instead, until a choice is made.
  const [chosenId, setChosenId] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ slot: string; id: string } | null>(null)
  // A slot that has gone (a new species has no lineage) leaves the next one open.
  const open = slots.find((slot) => slot.id === chosenId) ?? next

  const base = cardOf(view, sheet.fields, actions.values, rules)
  const tried = preview ? cardOf(withPick(view, preview.slot, preview.id), sheet.fields, actions.values, rules) : base

  function choose(slot: string, id: string) {
    commitPick(actions, view, slot, id)
    setPreview(null)
    setChosenId(null)
  }

  // The option being hovered or focused in the open slot.
  const previewId = preview && preview.slot === open?.id ? preview.id : null
  // Written at the caret: the option tried, else the suggested one.
  const ghostId = previewId ?? open?.suggested ?? null
  const ghost = open && ghostId ? { slot: open.id, id: ghostId, suggested: previewId === null } : null

  return {
    view,
    rules,
    slots,
    open,
    complete: next === null,
    // The suggestion at the caret, which Tab or Enter accepts.
    suggestion: ghost?.suggested && open?.id === next?.id ? ghostId : null,
    ghost,
    base,
    tried,
    previewId,
    show: setChosenId,
    toggle: (slot: string) => setChosenId(open?.id === slot ? null : slot),
    preview: (slot: string, id: string | null) => setPreview(id ? { slot, id } : null),
    choose,
  }
}
