import { resetToSuggested } from "@/lib/character-rules"
import type { SheetActions } from "./character-actions"
import { changeCharacter } from "./character-change"

// Gives the picks of these fields back to the suggestion, through the character rules like any
// other change, and says so in a toast with Undo. `label` is what was reset: "Fighting Style".
export const resetPicks = (actions: SheetActions, fields: string[], label: string) =>
  changeCharacter(actions, resetToSuggested(fields), `Reset ${label} to suggested`, true)
