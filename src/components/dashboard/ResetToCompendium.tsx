import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CREATURE_STATS_FIELD, newCreatureStats, readCreatureStats, sourceMonster } from "@/lib/creature-stats"
import { ConfirmDialog } from "./ConfirmDialog"
import type { WorldFieldsState } from "./WorldFields"

// In the entry's menu: puts the stat block back as the SRD has it, undoing the GM's edits.
// Only for an entry whose stat block was copied from the SRD.
export function ResetToCompendium({ state }: { state: WorldFieldsState }) {
  const [asking, setAsking] = useState(false)
  const stats = readCreatureStats(state.fields?.[CREATURE_STATS_FIELD]?.value)
  const monster = sourceMonster(stats?.compendiumRef)
  if (!monster) return null

  async function reset() {
    await state.saveNow(CREATURE_STATS_FIELD, "creature_stats", newCreatureStats(monster!))
    setAsking(false)
  }

  return (
    <section className="flex flex-col gap-3 border-b px-5 py-4">
      <div>
        <h3 className="text-sm font-medium">Stat block</h3>
        <p className="text-muted-foreground mt-0.5 text-[13px] leading-snug">
          Put the stat block back as the SRD has it. Your changes to it are lost.
        </p>
      </div>
      <Button variant="outline" className="w-fit" onClick={() => setAsking(true)}>
        Reset to SRD
      </Button>
      <ConfirmDialog
        open={asking}
        title={`Reset to ${monster.name}?`}
        description="The stat block goes back to the SRD version. Changes you made to it cannot be recovered."
        confirmLabel="Reset"
        busy={false}
        error={null}
        onCancel={() => setAsking(false)}
        onConfirm={reset}
      />
    </section>
  )
}
