import { useEffect, useRef, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { useHoldRepeat } from "@/hooks/use-hold-repeat"

type Props = {
  direction: 1 | -1
  disabled: boolean
  onStep: () => void
}

const FLASH_MS = 160

// Half of the Health tile: press to change health by one, hold to repeat.
// Every step blinks a soft wash from the outer edge, red to lose, green to gain.
export function HealthZone({ direction, disabled, onStep }: Props) {
  const [flash, setFlash] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const hold = useHoldRepeat(() => {
    onStep()
    setFlash(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setFlash(false), FLASH_MS)
  })
  const gain = direction > 0
  const Icon = gain ? Plus : Minus

  return (
    <button
      type="button"
      aria-label={gain ? "Gain 1 health" : "Lose 1 health"}
      disabled={disabled}
      className={`group/zone text-muted-foreground absolute inset-y-0 flex w-1/2 touch-manipulation items-center outline-none focus-visible:bg-muted/60 disabled:pointer-events-none ${
        gain ? "right-0 justify-end pr-2.5" : "left-0 justify-start pl-2.5"
      }`}
      {...hold}
    >
      <span
        aria-hidden
        className={`absolute inset-0 transition-opacity ease-out ${
          flash ? "opacity-100 duration-75" : "opacity-0 duration-300"
        } ${
          gain
            ? "bg-gradient-to-l from-emerald-500/25 to-transparent"
            : "bg-gradient-to-r from-red-500/25 to-transparent"
        }`}
      />
      <Icon
        className={`relative size-4 opacity-30 transition-[opacity,scale,color] group-disabled/zone:opacity-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/zone:opacity-40 ${
          flash
            ? `scale-125 opacity-100! ${gain ? "text-emerald-500" : "text-red-500"}`
            : ""
        }`}
      />
    </button>
  )
}
