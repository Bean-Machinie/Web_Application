import { abilityFacts } from "./ability-facts"
import type { SheetActions } from "./character-actions"

// Once a background is chosen and its increase is not, a quiet way to the dialog's second step.
export function BackgroundIncreaseLink({ actions, onOpen }: { actions: SheetActions; onOpen: () => void }) {
  const facts = abilityFacts(actions)
  if (!facts.background || facts.increaseId) return null

  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-muted-foreground hover:text-foreground w-fit text-xs underline-offset-4 hover:underline"
    >
      Background increase not chosen
    </button>
  )
}
