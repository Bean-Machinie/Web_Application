import { Minus, Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useHoldRepeat } from "@/hooks/use-hold-repeat"
import { POINT_BUY_MIN } from "@/lib/character-templates/srd-5-2-1"
import { buyScore, raiseCost } from "@/lib/quick-abilities"

type Props = {
  label: string
  base: number | null
  // The points still to spend.
  left: number
  onScore: (score: number) => void
}

type SideProps = { direction: 1 | -1; label: string; disabled: boolean; onStep: () => void }

// Half of the cell, as the creature's health block splits: press to step, hold to repeat.
function Side({ direction, label, disabled, onStep }: SideProps) {
  const [flash, setFlash] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  // Every step blinks a light wash from the outer edge.
  const hold = useHoldRepeat(() => {
    onStep()
    setFlash(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setFlash(false), 160)
  })
  const Icon = direction > 0 ? Plus : Minus
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={`group/side text-foreground focus-visible:bg-accent/40 absolute inset-y-0 flex w-1/2 touch-manipulation items-center outline-none select-none disabled:pointer-events-none ${direction > 0 ? "right-0 justify-end pr-4" : "left-0 justify-start pl-4"}`}
      {...hold}
    >
      <span
        aria-hidden
        className={`absolute inset-0 from-white/25 to-transparent transition-opacity ease-out ${flash ? "opacity-100 duration-75" : "opacity-0 duration-300"} ${direction > 0 ? "bg-gradient-to-l" : "bg-gradient-to-r"}`}
      />
      <Icon className="relative size-4 opacity-60 transition-opacity group-hover/side:opacity-100 group-disabled/side:opacity-0" />
    </button>
  )
}

// Point buy inside the cell itself: the left half lowers the base score in the line, the right half
// raises it, with a quiet minus and plus at the edges.
export function QuickPointBuySides({ label, base, left, onScore }: Props) {
  const score = buyScore(base)
  const next = raiseCost(score)
  return (
    <>
      <Side direction={-1} label={`Lower ${label}`} disabled={score <= POINT_BUY_MIN} onStep={() => onScore(score - 1)} />
      <Side direction={1} label={`Raise ${label}`} disabled={next === null || next > left} onStep={() => onScore(score + 1)} />
    </>
  )
}
