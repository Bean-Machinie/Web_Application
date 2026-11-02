import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { notation, rollAge } from "@/lib/dice"
import type { Roll } from "@/lib/dice"
import { DieIcon } from "./DieIcon"

const MODE_NAMES = { normal: "", advantage: "Advantage", disadvantage: "Disadvantage" }

// The values thrown; with two d20s the dropped one is struck through and muted.
function Values({ roll }: { roll: Roll }) {
  const name = MODE_NAMES[roll.mode]
  return (
    <p className="text-muted-foreground text-xs tabular-nums">
      {name && `${name} · `}
      {roll.dice.map((die, index) => (
        <span key={index} className={cn(index !== roll.kept && "line-through opacity-60", index === roll.kept && roll.dice.length > 1 && "text-foreground")}>
          {index > 0 && ", "}
          {die}
        </span>
      ))}
    </p>
  )
}

function RollRow({ roll, now }: { roll: Roll; now: number }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className="border-border/60 hover:bg-muted/40 flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0"
    >
      <DieIcon sides={roll.sides} showNumber={false} className="size-6 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium tabular-nums">{notation(roll)}</p>
        <Values roll={roll} />
      </div>
      <div className="text-right">
        <p className="text-xl leading-none font-semibold tabular-nums">{roll.total}</p>
        <p className="text-muted-foreground mt-1 text-xs">{rollAge(roll.at, now)}</p>
      </div>
    </motion.li>
  )
}

type Props = { rolls: Roll[]; onClear: () => void }

export function DiceHistory({ rolls, onClear }: Props) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    // Runs to the edges of the panel and takes what is left of it; only the list scrolls.
    <section className="-mx-4 -mb-4 flex min-h-0 flex-1 flex-col border-t">
      <div className="bg-muted/40 flex items-center justify-between border-b px-4 py-1">
        <h3 className="text-muted-foreground text-xs font-medium">Recent rolls</h3>
        <Button variant="ghost" size="xs" className="text-muted-foreground -mr-2" disabled={rolls.length === 0} onClick={onClear}>
          Clear
        </Button>
      </div>
      {rolls.length === 0 ? (
        <p className="text-muted-foreground px-4 py-4 text-sm">No rolls yet.</p>
      ) : (
        <ScrollArea type="scroll" className="min-h-0 flex-1">
          <ul>
            <AnimatePresence initial={false}>
              {rolls.map((roll) => (
                <RollRow key={roll.id} roll={roll} now={now} />
              ))}
            </AnimatePresence>
          </ul>
        </ScrollArea>
      )}
    </section>
  )
}
