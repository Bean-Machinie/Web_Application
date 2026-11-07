import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { PlusIcon } from "@/components/icons/PlusIcon"
import type { CharacterCardData } from "@/hooks/use-character-cards"
import { CharacterCards } from "./CharacterCards"
import { HomeAddCard } from "./HomeAddCard"
import { SectionLabel } from "./SectionLabel"

const SHOWN = 4

type Props = { cards: CharacterCardData[]; onCreate: () => void }

const LINK = "text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"

// Your characters as square portrait cards, up to four, and a tile to make another. The top padding
// leaves room for a card to lift on hover.
export function HomeCharacters({ cards, onCreate }: Props) {
  return (
    <section>
      <SectionLabel>Your characters</SectionLabel>
      <div className="grid grid-cols-2 gap-4 pt-1 sm:grid-cols-3 xl:grid-cols-5">
        <CharacterCards items={cards.slice(0, SHOWN)} />
        <HomeAddCard label="Create character" icon={PlusIcon} onClick={onCreate} className="aspect-square" />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <Link to="/app/characters" className={LINK}>
          Browse your characters
          <ArrowRight className="size-4" />
        </Link>
        <Link to="/app/compendium" className={LINK}>
          Browse the Compendium
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
