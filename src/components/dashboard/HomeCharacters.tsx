import { Link } from "react-router-dom"
import { ArrowRight, User } from "lucide-react"
import { PlusIcon } from "@/components/icons/PlusIcon"
import type { CharacterCardData } from "@/hooks/use-character-cards"
import { characterSubtitle } from "@/lib/character-summary"
import { characterPath, characterStartPath } from "@/lib/characters"
import { HomeAddCard } from "./HomeAddCard"
import { SectionLabel } from "./SectionLabel"

const SHOWN = 4

type Props = { cards: CharacterCardData[]; onCreate: () => void }

const LINK = "text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"

// Your characters as a compact row, up to four, 64px tall with a 48px portrait, and a tile of the
// same size to make another.
export function HomeCharacters({ cards, onCreate }: Props) {
  return (
    <section>
      <SectionLabel>Your characters</SectionLabel>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {cards.slice(0, SHOWN).map(({ character, summary }) => (
          <Link
            key={character.id}
            to={character.draft ? characterStartPath(character.id) : characterPath(character.id)}
            className="bg-card hover:border-border-strong focus-visible:ring-ring flex h-16 items-center gap-3 rounded-lg border p-2 outline-none transition-colors focus-visible:ring-2"
          >
            <span className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
              {character.portrait ? <img src={character.portrait.url} alt="" loading="lazy" className="size-full object-cover" /> : <User className="size-5" />}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{character.name}</span>
              <span className="text-muted-foreground truncate text-xs">{characterSubtitle(character, summary)}</span>
            </span>
          </Link>
        ))}
        <HomeAddCard label="Create character" icon={PlusIcon} onClick={onCreate} className="h-16 flex-row p-2" />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
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
