import { NONE } from "@/lib/character-format"
import type { CardModel } from "@/lib/quick-card"
import { QuickDetailRow } from "./QuickDetailRow"

type Props = {
  shown: CardModel
  base: CardModel
  concept: string
  // Opens the sheet of a pick; none until the class, species and background are chosen.
  onPick: ((pick: string) => void) | null
  // The species lets the player choose its size.
  sizeChoice: boolean
}

const languagesOf = (card: CardModel) => card.proficiency.languages.join(", ") || NONE

// The character's other particulars as a property list, each with the sheet that changes it: its
// size (where it is a choice), what it senses, the languages it knows, and its concept and alignment.
// A line with nothing to say is left out.
export function QuickCardProperties({ shown, base, concept, onPick, sizeChoice }: Props) {
  const open = (pick: string) => (onPick ? () => onPick(pick) : null)
  const details = [concept, shown.alignment].filter(Boolean).join(" · ") || NONE
  const detailsBefore = [concept, base.alignment].filter(Boolean).join(" · ") || NONE

  const rows = [
    { label: "Size", value: shown.size, changed: shown.size !== base.size, onOpen: sizeChoice ? open("size") : null },
    { label: "Senses", value: shown.senses, changed: shown.senses !== base.senses, onOpen: null },
    { label: "Languages", value: languagesOf(shown), changed: languagesOf(shown) !== languagesOf(base), onOpen: open("languages") },
    { label: "Details", value: details, changed: details !== detailsBefore, onOpen: open("details") },
  ].filter((row) => row.value !== NONE)
  if (rows.length === 0) return null

  return (
    <div aria-label="Details" className="-mx-2 flex flex-col">
      {rows.map((row) => <QuickDetailRow key={row.label} {...row} />)}
    </div>
  )
}
