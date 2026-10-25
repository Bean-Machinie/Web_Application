import { Badge } from "@/components/ui/badge"
import { featGrants, fromOthers } from "@/lib/character-grants"
import { featsOf } from "@/lib/character-templates/srd-5-2-1-feats"
import type { FeatCategory } from "@/lib/character-templates/srd-5-2-1-feats"
import { cn } from "@/lib/utils"
import { clearFields } from "./builder-clear"
import type { SheetActions } from "./character-actions"

type Props = { field: string; category: FeatCategory; recommended?: string; value: string[]; actions: SheetActions }

// A feat to choose from a category, as cards. A feat the character already holds from another
// source is shown but cannot be taken again, unless the SRD marks it Repeatable; Magic
// Initiate is taken once for each spell list, so each list is its own card.
export function BuilderFeatPicker({ field, category, recommended, value, actions }: Props) {
  const held = fromOthers(featGrants(actions), field)

  // Changing the feat drops what the old one asked for: a Magic Initiate ability, Skilled’s picks.
  function change(next: string | null) {
    const before = value[0]
    actions.onValue(field, next === null ? null : [next])
    clearFields(actions, [`${field}.ability`])
    if (before === "Skilled") clearFields(actions, ["skilled-picks"])
  }

  return (
    <div role="group" aria-label="Feats" className="grid gap-2 sm:grid-cols-2">
      {featsOf(category).map((feat) => {
        const source = held.find((grant) => grant.id === feat.id)?.source
        const blocked = !!source && !feat.repeatable
        const on = value.includes(feat.id)
        return (
          <button
            key={feat.id}
            type="button"
            aria-pressed={on}
            disabled={blocked}
            onClick={() => change(on ? null : feat.id)}
            className={cn(
              "focus-visible:ring-ring flex flex-col gap-0.5 rounded-lg border px-3.5 py-2.5 text-left outline-none focus-visible:ring-2 disabled:opacity-55",
              on ? "border-foreground bg-accent" : "hover:bg-accent/50"
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{feat.label}</span>
              {feat.id === recommended && <Badge variant="secondary">Recommended</Badge>}
            </span>
            <span className="text-muted-foreground text-xs">
              {blocked
                ? feat.spellList
                  ? `Already from ${source}. Choose a different spell list.`
                  : `Already from ${source}. A feat can be taken only once.`
                : feat.benefit}
            </span>
          </button>
        )
      })}
    </div>
  )
}
