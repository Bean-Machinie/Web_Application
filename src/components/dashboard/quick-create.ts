import type { useCharacter } from "@/hooks/use-character"
import { origins } from "@/lib/character-grants"
import { planQuickBuild } from "@/lib/quick-plan"
import { readRules, SUGGESTED_FIELD } from "@/lib/quick-state"
import type { SheetActions } from "./character-actions"
import { applyKits } from "./character-kits"

// Fills in a character from its class, species and background: the suggested scores, picks and
// equipment, each marked as suggested. Nothing is done while one of the three is missing.
export function applyQuickBuild(actions: SheetActions, sheet: ReturnType<typeof useCharacter>) {
  const { cls, species, background } = origins(actions)
  if (!cls || !species || !background) return false
  const plan = planQuickBuild(cls, species, background, readRules(actions.values))

  for (const [field, value] of Object.entries(plan.values)) actions.onValue(field, value)
  // The scores are only stored now, so the kits' attacks read the modifiers they will have.
  const derived = { ...actions.derived, "str.mod": plan.modifiers.str, "dex.mod": plan.modifiers.dex }
  applyKits({ ...actions, derived }, [plan.classKit, plan.backgroundKit])
  sheet.setValue(SUGGESTED_FIELD, plan.suggested)
  return true
}
