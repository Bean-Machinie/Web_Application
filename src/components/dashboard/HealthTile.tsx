import { Heart } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { currentHealth } from "@/lib/stat-block"
import type { StatBlock } from "@/lib/stat-block"
import { HealthBar } from "./HealthBar"
import { HealthControls } from "./HealthControls"

type Props = {
  block: StatBlock
  // Null for players: read-only, no popover.
  onChange: ((change: Partial<StatBlock>) => void) | null
}

const valueClass = "h-10 truncate text-center text-xl leading-10 font-semibold tabular-nums"

// Sized like the Defense and Speed tiles. Clicking it, as a GM, opens the
// quick controls.
export function HealthTile({ block, onChange }: Props) {
  const max = block.health
  const current = currentHealth(block)
  const hasMax = max !== undefined && current !== undefined

  // Full health is stored as "no current value", so it follows the maximum.
  const setCurrent = (value: number | undefined) => {
    if (max === undefined) return
    const next = value === undefined ? undefined : Math.min(Math.max(value, 0), max)
    onChange?.({ healthCurrent: next === max ? undefined : next })
  }

  const value = (
    <>
      {hasMax ? current : "—"}
      {hasMax && <span className="text-muted-foreground font-normal"> / {max}</span>}
    </>
  )

  return (
    <div className="relative flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-3">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Heart className="size-3.5" />
        Health
      </span>
      {onChange ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Edit health"
              className={`${valueClass} hover:bg-muted data-[state=open]:bg-muted focus-visible:ring-ring w-full cursor-pointer rounded-md outline-none transition-colors focus-visible:ring-2`}
            >
              {value}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="center">
            <HealthControls
              current={current}
              max={max}
              onCurrent={setCurrent}
              onMax={(health) => onChange({ health })}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <span className={valueClass}>{value}</span>
      )}
      {hasMax && <HealthBar current={current} max={max} />}
    </div>
  )
}
