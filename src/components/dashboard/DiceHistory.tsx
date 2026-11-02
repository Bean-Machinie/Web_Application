import { cn } from "@/lib/utils"
import { notation } from "@/lib/dice"
import type { Roll } from "@/lib/dice"

function Dice({ roll }: { roll: Roll }) {
  if (roll.dice.length === 1 && roll.modifier === 0) return null
  return (
    <span className="text-muted-foreground tabular-nums">
      (
      {roll.dice.map((die, index) => (
        <span key={index} className={cn(roll.dice.length > 1 && index === roll.kept && "text-foreground font-medium")}>
          {index > 0 && ", "}
          {die}
        </span>
      ))}
      )
    </span>
  )
}

// The last few rolls of this visit, newest first, in the rows of the rules panel.
export function DiceHistory({ rolls }: { rolls: Roll[] }) {
  return (
    <section className="grid gap-1.5">
      <h3 className="text-muted-foreground text-xs font-medium">Recent rolls</h3>
      {rolls.length === 0 ? (
        <p className="text-muted-foreground py-1.5 text-sm">No rolls yet.</p>
      ) : (
        <ul className="grid text-sm">
          {rolls.map((roll) => (
            <li key={roll.id} className="border-border/60 flex items-baseline justify-between gap-4 border-b py-1.5 last:border-b-0">
              <span className="flex items-baseline gap-2">
                <span className="tabular-nums">{notation(roll)}</span>
                <Dice roll={roll} />
              </span>
              <span className="font-medium tabular-nums">{roll.total}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
