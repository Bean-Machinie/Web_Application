import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { forceFace, getForced, subscribeForced } from "@/lib/dice-dev"
import type { Face } from "@/lib/dice-dev"

// Development only. "Force" arms the next d20; a second press disarms it.
export function DiceDevRow({ onReplay }: { onReplay: () => void }) {
  const forced = useSyncExternalStore(subscribeForced, getForced)
  const toggle = (face: Face) => forceFace(forced === face ? null : face)
  return (
    <div className="text-muted-foreground -mx-4 flex items-center gap-1 border-t px-4 pt-3 text-xs">
      <span className="mr-auto">Dev</span>
      <Button variant={forced === 20 ? "secondary" : "ghost"} size="sm" onClick={() => toggle(20)}>
        Force 20
      </Button>
      <Button variant={forced === 1 ? "secondary" : "ghost"} size="sm" onClick={() => toggle(1)}>
        Force 1
      </Button>
      <Button variant="ghost" size="sm" onClick={onReplay}>
        Replay
      </Button>
    </div>
  )
}
