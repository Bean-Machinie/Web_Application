import type { Card } from "@/lib/character-cards"
import { backgroundFeat } from "@/lib/character-cards"
import { origins } from "@/lib/character-grants"
import { featById } from "@/lib/character-templates/srd-5-2-1-feats"
import { BuilderChoiceCard } from "./BuilderChoiceCard"
import { BuilderFeatPicker } from "./BuilderFeatPicker"
import type { SheetActions } from "./character-actions"

type Props = { cards: Card[]; actions: SheetActions }

// The Origin feats: the one the background gives, fixed, and the one a Human picks with
// Versatile. Nothing is picked for the Human.
export function BuilderFeatsCard({ cards, actions }: Props) {
  const { background } = origins(actions)
  const fixed = backgroundFeat(actions)
  const picked = cards.find((card) => card.decl.kind === "feat" && card.decl.category === "origin")
  if (!fixed && !picked) return null

  const taken = cards.filter((card) => card.decl.kind === "feat" && card.decl.category === "origin")
  const total = (fixed ? 1 : 0) + taken.length
  const done = (fixed ? 1 : 0) + taken.filter((card) => card.done).length

  return (
    <BuilderChoiceCard title="Origin feats" status={done === total ? "Done" : `${done} of ${total} chosen`}>
      {fixed && background && (
        <div className="flex justify-between gap-3 rounded-lg border border-dashed px-3.5 py-3 text-sm">
          <span>
            <span className="font-medium">{fixed.label}</span>{" "}
            <span className="text-muted-foreground">· {featById(fixed.id)?.benefit}</span>
          </span>
          <span className="text-muted-foreground shrink-0 text-xs">From {background.label}</span>
        </div>
      )}
      {taken.map((card) =>
        card.decl.kind === "feat" ? (
          <div key={card.decl.field} className="grid gap-2">
            <p className="flex items-center gap-2 text-sm">
              <span className="font-medium">{card.decl.title}</span>
              <span className="text-muted-foreground text-xs">Pick one more origin feat</span>
            </p>
            <BuilderFeatPicker field={card.decl.field} category="origin" recommended={card.decl.recommended} value={card.chosen} actions={actions} />
          </div>
        ) : null
      )}
    </BuilderChoiceCard>
  )
}
