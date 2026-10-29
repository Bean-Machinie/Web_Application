import type { CardModel } from "@/lib/quick-card"
import type { Character } from "@/lib/characters"
import { openSlots } from "@/lib/quick-review"
import type { Slot } from "@/lib/quick-slots"
import type { QuickView } from "@/lib/quick-view"
import { QuickCardFinish } from "./QuickCardFinish"
import { QuickCardIdentity } from "./QuickCardIdentity"
import { QuickCardLists } from "./QuickCardLists"
import { QuickCardNumbers } from "./QuickCardNumbers"

type Props = {
  character: Character
  userId: string
  view: QuickView
  slots: Slot[]
  shown: CardModel
  base: CardModel
  onName: (name: string) => void
  onPortrait: (portrait: Character["portrait"]) => Promise<boolean>
  onOpenSlot: (slot: string) => void
  // Stacked above the picker on a narrow screen, so boxed; in the side panel it is not.
  compact: boolean
}

// The live character, in the side panel, and a compact summary above the picker below 1000px. `shown` is the card with the hovered option tried on.
export function QuickCharacterCard({ character, userId, view, slots, shown, base, onName, onPortrait, onOpenSlot, compact }: Props) {
  return (
    <section aria-label={compact ? "Your character" : undefined} className={compact ? "bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-xs" : "flex flex-col gap-4"}>
      <QuickCardIdentity
        character={character}
        userId={userId}
        iconKind={view.cls ? "class" : "species"}
        speciesId={view.species}
        line={shown.line}
        lineChanged={shown.line !== base.line}
        onName={onName}
        onPortrait={onPortrait}
      />
      <QuickCardNumbers shown={shown} base={base} />
      <QuickCardLists shown={shown} base={base} />
      <QuickCardFinish open={openSlots(slots)} onOpen={onOpenSlot} />
    </section>
  )
}
