import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import { parseIncrease } from "@/lib/character-templates/dnd-5e-2024-tables"
import { abilityFacts } from "./ability-facts"
import { BuilderIncreaseRows } from "./BuilderIncreaseRows"
import type { SheetActions } from "./character-actions"

const nameOf = (id: string) => ABILITIES.find(([other]) => other === id)![1]

// Part 2 of the Abilities step: the background’s increase, +2 and +1 or +1 to all three,
// among its three abilities.
export function BuilderIncreaseCard({ actions }: { actions: SheetActions }) {
  const { background, increaseId } = abilityFacts(actions)
  const parsed = parseIncrease(increaseId)
  const done = parsed?.mode === "split" ? `Done: +2 ${nameOf(parsed.two)}, +1 ${nameOf(parsed.one)}.` : parsed ? "Done: +1 to all three." : null

  return (
    <section aria-label="Background increase" className="bg-card flex min-w-0 flex-[2_1_300px] flex-col gap-2 rounded-lg border p-6 shadow-xs">
      <div>
        <span className="text-muted-foreground text-xs">Part 2</span>
        <h2 className="text-xl font-semibold">{background ? `${background.label} increase` : "Background increase"}</h2>
      </div>
      {background ? (
        <>
          <BuilderIncreaseRows key={background.id} background={background} stored={increaseId} actions={actions} />
          {done && <p className="text-sm">{done}</p>}
          <p className="text-muted-foreground mt-auto pt-3 text-xs">
            Only {background.label}’s three abilities can be raised. Change background in step 2.
          </p>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">Choose a background in step 2 to see which abilities it raises. You can skip this part.</p>
      )}
    </section>
  )
}
