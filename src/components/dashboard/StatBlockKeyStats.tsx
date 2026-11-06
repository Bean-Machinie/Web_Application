import type { ReactNode } from "react"
import { signed } from "@/lib/character-format"
import { speedText } from "@/lib/stat-block-format"
import type { StatBlock } from "@/lib/stat-block-types"
import { DiceText } from "./DiceText"

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2.5">
      <dt className="text-muted-foreground text-xs font-medium">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  )
}

// AC, Initiative, HP and Speed in one row of tiles.
export function StatBlockKeyStats({ block }: { block: StatBlock }) {
  return (
    <dl className="bg-card grid grid-cols-2 divide-x rounded-lg border shadow-xs sm:grid-cols-4 [&>div:nth-child(n+3)]:max-sm:border-t">
      <Stat label="AC">{block.ac}</Stat>
      <Stat label="Initiative">
        {signed(block.initiative.modifier)} ({block.initiative.score})
      </Stat>
      <Stat label="HP">
        <DiceText text={`${block.hp.average} (${block.hp.formula})`} />
      </Stat>
      <Stat label="Speed">{speedText(block.speed)}</Stat>
    </dl>
  )
}
