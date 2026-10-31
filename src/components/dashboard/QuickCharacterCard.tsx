import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import type { CardModel } from "@/lib/quick-card"
import type { Character } from "@/lib/characters"
import type { Attention } from "@/lib/quick-attention"
import { openSlots } from "@/lib/quick-slots"
import type { Slot } from "@/lib/quick-slots"
import type { QuickView } from "@/lib/quick-view"
import type { SheetActions } from "./character-actions"
import { QuickCardAbilities } from "./QuickCardAbilities"
import { QuickCardCombat } from "./QuickCardCombat"
import { QuickCardFinish } from "./QuickCardFinish"
import { QuickCardIdentity } from "./QuickCardIdentity"
import { QuickCardProperties } from "./QuickCardProperties"

type Props = {
  character: Character
  userId: string
  view: QuickView
  slots: Slot[]
  shown: CardModel
  base: CardModel
  actions: SheetActions
  onName: (name: string) => void
  onPortrait: (portrait: Character["portrait"]) => Promise<boolean>
  onOpenSlot: (slot: string) => void
  // Opens an ability in the Abilities workspace.
  onOpenAbility: (ability: AbilityId) => void
  // Opens the panel of a pick; none until the class, species and background are chosen.
  onPick: ((pick: string) => void) | null
  needs: Attention[]
  sizeChoice: boolean
  // All of it, boxed, above the picker on a narrow screen; or in the side panel, where the portrait
  // and the rest are two panels with a divider between: "top" is the portrait and the name,
  // "body" the numbers and particulars.
  part: "all" | "top" | "body"
}

// The live character: who it is, its combat numbers, the abilities and its particulars. `shown`
// is the card with the hovered option tried on.
export function QuickCharacterCard({ character, userId, view, slots, shown, base, actions, onName, onPortrait, onOpenSlot, onOpenAbility, onPick, needs, sizeChoice, part }: Props) {
  const identity = (
    <QuickCardIdentity
      character={character}
      userId={userId}
      iconKind={view.cls ? "class" : "species"}
      line={shown.line}
      lineChanged={shown.line !== base.line}
      fit={part === "top"}
      onName={onName}
      onPortrait={onPortrait}
    />
  )
  if (part === "top") return identity

  const body = (
    <>
      <QuickCardCombat shown={shown} base={base} actions={actions} />
      <QuickCardAbilities shown={shown} base={base} actions={actions} onOpen={onOpenAbility} />
      <QuickCardProperties shown={shown} base={base} concept={character.concept} onPick={onPick} sizeChoice={sizeChoice} />
      <QuickCardFinish open={openSlots(slots)} needs={onPick ? needs : []} onOpen={onOpenSlot} onPick={(pick) => onPick?.(pick)} />
    </>
  )
  if (part === "body") return <section className="flex flex-col gap-4">{body}</section>

  return (
    <section aria-label="Your character" className="bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-xs">
      {identity}
      {body}
    </section>
  )
}
