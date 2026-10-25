import { Link } from "react-router-dom"
import { firstUnfinished } from "@/lib/character-builder"
import type { builderProgress } from "@/lib/character-builder"
import { characterBuildPath } from "@/lib/characters"

// One quiet line over the sheet while class, background, species or ability scores are still
// missing, linking to the first of them.
export function BuilderBanner({ characterId, progress }: { characterId: string; progress: ReturnType<typeof builderProgress> }) {
  const step = firstUnfinished(progress)
  if (!step) return null

  return (
    <Link
      to={characterBuildPath(characterId, step.id)}
      className="bg-muted/50 hover:bg-muted flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors"
    >
      <span>Finish building your character</span>
      <span className="text-muted-foreground text-xs">Next: {step.label} →</span>
    </Link>
  )
}
