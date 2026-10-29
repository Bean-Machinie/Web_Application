import type { CardModel } from "@/lib/quick-card"
import type { Character } from "@/lib/characters"
import type { QuickView } from "@/lib/quick-view"
import { QuickCardIdentity } from "./QuickCardIdentity"
import { QuickCardStats } from "./QuickCardStats"

type Props = {
  character: Character
  userId: string
  view: QuickView
  shown: CardModel
  base: CardModel
  onName: (name: string) => void
  onPortrait: (portrait: Character["portrait"]) => Promise<boolean>
}

// The live character card: about 300px and sticky beside the sentence, and a compact row
// above it below 1000px. `shown` is the card with the hovered option tried on.
export function QuickCharacterCard({ character, userId, view, shown, base, onName, onPortrait }: Props) {
  return (
    <aside
      aria-label="Your character"
      className="bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-xs max-[999px]:flex-row max-[999px]:flex-wrap max-[999px]:items-start min-[1000px]:sticky min-[1000px]:top-4 min-[1000px]:w-[300px] min-[1000px]:shrink-0"
    >
      <div className="max-[999px]:w-72 max-[999px]:max-w-full">
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
      </div>
      <QuickCardStats shown={shown} base={base} />
    </aside>
  )
}
