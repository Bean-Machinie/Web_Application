import { BuilderIncreaseCard } from "./BuilderIncreaseCard"
import { BuilderPointBuy } from "./BuilderPointBuy"
import { BuilderScoreTiles } from "./BuilderScoreTiles"
import type { BuilderProps } from "./builder-types"

// Step 4: the base scores by point buy, the background’s increase, and the result.
export function BuilderAbilitiesStep({ actions }: BuilderProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-stretch gap-5">
        <BuilderPointBuy actions={actions} />
        <BuilderIncreaseCard actions={actions} />
      </div>
      <BuilderScoreTiles actions={actions} />
    </div>
  )
}
