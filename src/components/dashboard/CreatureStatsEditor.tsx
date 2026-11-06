import { useState } from "react"
import { Button } from "@/components/ui/button"
import { readCreatureStats, sourceMonster } from "@/lib/creature-stats"
import type { FieldEditorProps } from "./field-types"
import { StatBlock } from "./StatBlock"
import { StatBlockForm } from "./StatBlockForm"

// The GM's copy of a creature's stat block: read like anyone's, and edited here.
export function CreatureStatsEditor({ value, onChange }: FieldEditorProps) {
  const [editing, setEditing] = useState(false)
  const stats = readCreatureStats(value)
  if (!stats) return <p className="text-muted-foreground text-sm">No stat block.</p>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-8 items-center justify-end gap-3">
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
          {editing ? "Done" : "Edit"}
        </Button>
      </div>
      {editing ? (
        <StatBlockForm block={stats.statBlock} onChange={(statBlock) => onChange({ ...stats, statBlock })} />
      ) : (
        <StatBlock block={stats.statBlock} source={sourceMonster(stats.compendiumRef)?.source} />
      )}
    </div>
  )
}
