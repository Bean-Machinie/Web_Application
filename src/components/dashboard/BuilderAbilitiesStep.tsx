import { abilityFacts } from "./ability-facts"
import { BuilderAbilitiesCard } from "./BuilderAbilitiesCard"
import type { BuilderProps } from "./builder-types"

// Step 4: the base scores by point buy, the background’s increase, and the result, in one table.
export function BuilderAbilitiesStep({ actions }: BuilderProps) {
  const { background } = abilityFacts(actions)
  return <BuilderAbilitiesCard key={background?.id ?? "none"} actions={actions} />
}
