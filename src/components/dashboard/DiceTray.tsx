import { motion, useAnimationControls } from "motion/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DICE, rollLabel } from "@/lib/dice"
import type { D20Mode, Sides } from "@/lib/dice"
import { DieIcon } from "./DieIcon"

const SPRING = { type: "spring", stiffness: 600, damping: 18, mass: 0.6 } as const
const DIE_VARIANTS = { rest: { rotate: 0, scale: 1 }, hover: { rotate: 8, scale: 1.1 } }

type TileProps = { sides: Sides; modifier: number; mode: D20Mode; onRoll: (sides: Sides) => void }

// Lifts on hover like the template cards; the die tilts, and spins away when it is thrown.
function DieTile({ sides, modifier, mode, onRoll }: TileProps) {
  const spin = useAnimationControls()

  function throwDie() {
    onRoll(sides)
    spin.start({ rotate: 360, scale: [1, 0.7, 1], transition: { duration: 0.45 } }).then(() => spin.set({ rotate: 0 }))
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          type="button"
          onClick={throwDie}
          initial="rest"
          animate="rest"
          whileHover="hover"
          whileTap={{ scale: 0.97 }}
          variants={{ rest: { y: 0 }, hover: { y: -4 } }}
          transition={SPRING}
          className="bg-card hover:bg-muted/60 focus-visible:ring-ring flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg border py-2 outline-none focus-visible:ring-2"
        >
          <motion.span variants={DIE_VARIANTS} transition={SPRING} className="flex">
            <motion.span animate={spin} className="flex">
              <DieIcon sides={sides} className="size-8" />
            </motion.span>
          </motion.span>
          <span className="text-muted-foreground text-[11px] font-medium">d{sides}</span>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>{rollLabel(sides, modifier, mode)}</TooltipContent>
    </Tooltip>
  )
}

type Props = { modifier: number; mode: D20Mode; onRoll: (sides: Sides) => void }

export function DiceTray({ modifier, mode, onRoll }: Props) {
  return (
    <div className="flex gap-1.5 pt-1">
      {DICE.map((sides) => (
        <DieTile key={sides} sides={sides} modifier={modifier} mode={mode} onRoll={onRoll} />
      ))}
    </div>
  )
}
