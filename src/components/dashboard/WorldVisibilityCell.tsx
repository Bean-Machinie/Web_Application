import { useContext } from "react"
import type { WorldEntry } from "@/lib/world-entries"
import { VisibilitySwitch } from "./VisibilitySwitch"
import { WorldTableContext } from "./WorldTableContext"

export function WorldVisibilityCell({ entry }: { entry: WorldEntry }) {
  const { manage } = useContext(WorldTableContext)
  if (!manage) return null

  return (
    <div className="relative z-10 w-fit">
      <VisibilitySwitch
        compact
        revealed={entry.revealed}
        name={entry.name}
        onChange={(revealed) => manage.onReveal(entry, revealed)}
      />
    </div>
  )
}
