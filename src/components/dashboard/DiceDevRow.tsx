import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { forceRoll, getForced, subscribeForced } from "@/lib/dice-dev"
import type { Force } from "@/lib/dice-dev"

// Development only. "Force" arms the next roll of any die to land on its highest or lowest face; a second press disarms it.
export function DiceDevRow({ onReplay }: { onReplay: () => void }) {
  const forced = useSyncExternalStore(subscribeForced, getForced)
  const toggle = (next: Force) => forceRoll(forced === next ? null : next)
  return (
    <div className="text-muted-foreground -mx-4 flex items-center gap-1 border-t px-4 pt-3 text-xs">
      <span className="mr-auto">Dev</span>
      <Button variant={forced === "max" ? "secondary" : "ghost"} size="sm" onClick={() => toggle("max")}>
        Force max
      </Button>
      <Button variant={forced === "min" ? "secondary" : "ghost"} size="sm" onClick={() => toggle("min")}>
        Force min
      </Button>
      <Button variant="ghost" size="sm" onClick={onReplay}>
        Replay
      </Button>
    </div>
  )
}
