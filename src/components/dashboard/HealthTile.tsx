import { Heart, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useRunningTotal } from "@/hooks/use-running-total"
import { currentHealth } from "@/lib/stat-block"
import type { StatBlock } from "@/lib/stat-block"
import { HealthBar } from "./HealthBar"
import { HealthMax } from "./HealthMax"
import { HealthZone } from "./HealthZone"

type Props = {
  block: StatBlock
  // Null for players: read-only, no controls.
  onChange: ((change: Partial<StatBlock>) => void) | null
}

// Sized like the Defense and Speed tiles. For a GM it works like a life
// counter: the left half lowers health by one, the right half raises it.
export function HealthTile({ block, onChange }: Props) {
  const max = block.health
  const current = currentHealth(block)
  const hasMax = max !== undefined && current !== undefined
  const running = useRunningTotal()

  // Full health is stored as "no current value", so it follows the maximum.
  const setCurrent = (next: number) => {
    if (!onChange || !hasMax || next === current) return
    running.add(next - current)
    onChange({ healthCurrent: next === max ? undefined : next })
  }
  const step = (direction: 1 | -1) => setCurrent(Math.min(Math.max(current! + direction, 0), max!))

  return (
    <div className="group relative flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-3 select-none">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Heart className="size-3.5" />
        Health
      </span>
      {onChange && (
        <>
          <HealthZone direction={-1} disabled={!hasMax || current === 0} onStep={() => step(-1)} />
          <HealthZone direction={1} disabled={!hasMax || current === max} onStep={() => step(1)} />
        </>
      )}
      <div className="pointer-events-none relative flex flex-col items-center">
        <span className="relative h-5 text-xl leading-5 font-semibold tabular-nums">
          {hasMax ? current : "—"}
          <span
            aria-hidden
            className={`absolute top-0 left-full ml-1.5 text-sm font-medium transition-opacity duration-300 ${
              running.total < 0 ? "text-red-500" : "text-emerald-500"
            } ${running.visible ? "opacity-100" : "opacity-0"}`}
          >
            {running.total > 0 ? `+${running.total}` : `−${-running.total}`}
          </span>
        </span>
        <HealthMax max={max} onSave={onChange && ((health) => onChange({ health }))} />
      </div>
      {onChange && hasMax && current !== max && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground absolute top-1 right-1 z-10 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
              aria-label="Reset to full health"
              onClick={() => setCurrent(max)}
            >
              <RotateCcw />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset to full</TooltipContent>
        </Tooltip>
      )}
      {hasMax && <HealthBar current={current} max={max} />}
    </div>
  )
}
