import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { notation, rollAge } from "@/lib/dice"
import type { Roll } from "@/lib/dice"
import { useDieSnapshot } from "@/hooks/use-die-snapshot"
import { DieIcon } from "./DieIcon"
import { ScrollShadow } from "./ScrollShadow"

const MODE_NAMES = { normal: "", advantage: "Advantage", disadvantage: "Disadvantage" }

// The values thrown. With two d20s the dropped one is struck through and muted; a d100 shows its
// two dice, "40 + 7".
function Values({ roll }: { roll: Roll }) {
  if (roll.sides === 100) {
    const [tens, units] = roll.dice
    return <p className="text-muted-foreground text-xs tabular-nums">{`${String(tens).padStart(2, "0")} + ${units}`}</p>
  }
  const name = MODE_NAMES[roll.mode]
  const compared = roll.mode !== "normal"
  return (
    <p className="text-muted-foreground text-xs tabular-nums">
      {name && `${name} · `}
      {roll.dice.map((die, index) => (
        <span key={index} className={cn(compared && index !== roll.kept && "line-through opacity-60", compared && index === roll.kept && "text-foreground")}>
          {index > 0 && ", "}
          {die}
        </span>
      ))}
    </p>
  )
}

// The die as thrown; its small drawing stands in until the picture is ready.
function RollDie({ sides }: { sides: Roll["sides"] }) {
  const picture = useDieSnapshot(sides)
  return picture ? <img src={picture} alt="" className="size-7 shrink-0" /> : <DieIcon sides={sides} showNumber={false} className="size-7 shrink-0" />
}

function RollRow({ roll, now }: { roll: Roll; now: number }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className="border-border/60 hover:bg-muted/40 flex items-center gap-3 border-b py-2.5 last:border-b-0"
    >
      <RollDie sides={roll.sides} />
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
    // Takes what is left of the panel; the list scrolls between two hairlines, as in the rules panel.
    <section className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground text-xs font-medium">Recent rolls</h3>
        <Button variant="ghost" size="xs" className="text-muted-foreground -mr-2" disabled={rolls.length === 0} onClick={onClear}>
          Clear
        </Button>
      </div>
      <ScrollShadow>
        {rolls.length === 0 ? (
          <p className="text-muted-foreground text-sm">No rolls yet.</p>
        ) : (
          <ul>
            <AnimatePresence initial={false}>
              {rolls.map((roll) => (
                <RollRow key={roll.id} roll={roll} now={now} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </ScrollShadow>
    </section>
  )
}
