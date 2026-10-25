import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { choiceState } from "@/lib/character-choices"
import { characterBuildPath } from "@/lib/characters"
import { readStat } from "@/lib/character-values"
import { featGrants } from "@/lib/character-grants"
import type { SheetActions } from "./character-actions"

// What the builder made, read only, in the profile column: "Fighter 1", "Human · Soldier",
// the Origin feats, and the way back into the builder to change any of it.
export function CharacterSummary({ actions }: { actions: SheetActions }) {
  const label = (id: string) => {
    const field = actions.byId.get(id)
    return field ? (choiceState(field, actions.byId, actions.derived).selected?.label ?? null) : null
  }
  const level = readStat(actions.values.level?.value)
  const species = label("species-choice")
  const background = label("background-choice")
  const lines = [
    [label("character-class"), level].filter((part) => part !== null).join(" "),
    [species, background].filter(Boolean).join(" · "),
    // The background’s feat, and the Human’s Versatile one.
    featGrants(actions).map((grant) => grant.id).join(", "),
  ].filter(Boolean)

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-3 shadow-xs">
      <div className="flex flex-col gap-0.5">
        {lines.length > 0 ? (
          lines.map((line, index) => (
            <p key={line} className={index === 0 ? "text-sm font-medium" : "text-muted-foreground text-sm"}>
              {line}
            </p>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">Not built yet</p>
        )}
      </div>
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link to={characterBuildPath(actions.characterId)}>Edit character</Link>
      </Button>
    </div>
  )
}
