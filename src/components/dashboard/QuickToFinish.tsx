import { Link } from "react-router-dom"
import { origins } from "@/lib/character-grants"
import type { Derived } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import { CLASS_BUILD } from "@/lib/character-templates/srd-5-2-1-classes"
import { characterStartPath } from "@/lib/characters"
import type { Character, StoredValue } from "@/lib/characters"
import { pickQuery } from "@/lib/pick-info"
import { needsAttention } from "@/lib/quick-attention"
import { isQuickBuilt } from "@/lib/quick-state"

type Props = { character: Character; fields: SheetField[]; values: Record<string, StoredValue>; derived: Derived }

// What is left for the player on a character the quick build made, each item opening its panel
// in the builder, and the way back into the builder. Spells are on the sheet.
export function QuickToFinish({ character, fields, values, derived }: Props) {
  if (!isQuickBuilt(values)) return null
  const context = { values, derived, byId: new Map(fields.map((field) => [field.id, field])) }
  const { cls } = origins(context)
  const items = needsAttention(context).map((need) => ({ label: need.label, to: `${characterStartPath(character.id)}?${pickQuery(need.key)}` }))
  if (cls && CLASS_BUILD[cls.id].spellcaster) items.push({ label: "Spells", to: "?tab=spells" })

  return (
    <section aria-label="To finish" className="bg-card rounded-lg border p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">To finish</h2>
        <Link to={characterStartPath(character.id)} className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline">
          Edit character
        </Link>
      </div>
      {items.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {items.map((item) => (
            <li key={item.label}>
              <Link to={item.to} className="underline underline-offset-4">
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
