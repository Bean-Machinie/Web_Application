import { Link } from "react-router-dom"
import { toFinish } from "@/lib/quick-finish"
import type { Derived } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import { characterBuildPath } from "@/lib/characters"
import { isQuickBuilt } from "@/lib/quick-state"
import type { Character, StoredValue } from "@/lib/characters"

type Props = { character: Character; fields: SheetField[]; values: Record<string, StoredValue>; derived: Derived }

// What the quick build left to the player, each linking to where it is chosen, and the way into
// the detailed builder from its first step.
export function QuickToFinish(props: Props) {
  const items = toFinish(props)
  const id = props.character.id
  if (!isQuickBuilt(props.values)) return null

  return (
    <section aria-label="To finish" className="bg-card rounded-lg border p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">To finish</h2>
        <Link to={characterBuildPath(id, "class")} className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline">
          Customize all
        </Link>
      </div>
      {items.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {items.map((item) => (
            <li key={item.label}>
              <Link to={item.step === "spells" ? "?tab=spells" : characterBuildPath(id, item.step)} className="underline underline-offset-4">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-1 text-sm">Nothing left to choose.</p>
      )}
    </section>
  )
}
