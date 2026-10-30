import { Link } from "react-router-dom"
import { origins } from "@/lib/character-grants"
import type { GlossaryContext } from "@/lib/character-glossary"
import { characterStartPath } from "@/lib/characters"
import { CREATED_FIELD } from "@/lib/quick-state"

// One quiet line over the sheet while the character is a draft, or the class, species or
// background is still missing, linking back to the builder.
export function QuickBanner({ characterId, context }: { characterId: string; context: GlossaryContext }) {
  const { cls, species, background } = origins(context)
  const draft = context.values[CREATED_FIELD]?.value === false
  if (cls && species && background && !draft) return null

  return (
    <Link
      to={characterStartPath(characterId)}
      className="bg-muted/50 hover:bg-muted flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors"
    >
      <span>Finish building your character</span>
      <span className="text-muted-foreground text-xs">Continue →</span>
    </Link>
  )
}
