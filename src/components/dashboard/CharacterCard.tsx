import { Link } from "react-router-dom"
import { User } from "lucide-react"
import { TiltCard } from "@/components/TiltCard"
import { entityCardSkin } from "@/components/tilt-card-styles"
import { Badge } from "@/components/ui/badge"
import { characterSubtitle } from "@/lib/character-summary"
import type { CharacterSummary } from "@/lib/character-summary"
import { characterPath, characterStartPath } from "@/lib/characters"
import type { Character } from "@/lib/characters"

type Props = {
  character: Character
  summary: CharacterSummary | null
  // The campaign it is assigned to, if any.
  campaignName: string | null
}

// A character as the library's entity card: the portrait, the name and what it is. A draft opens the
// builder it was left in; anything else opens the sheet.
export function CharacterCard({ character, summary, campaignName }: Props) {
  return (
    <TiltCard className={`group ${entityCardSkin(false)}`}>
      <div className="flex h-full flex-col overflow-hidden rounded-[inherit]">
        <div className="bg-muted text-muted-foreground relative flex aspect-square items-center justify-center overflow-hidden">
          {character.portrait ? <img src={character.portrait.url} alt="" loading="lazy" className="size-full object-cover" /> : <User className="size-10" />}
          {campaignName && (
            <Badge variant="secondary" className="absolute top-2 left-2 max-w-[calc(100%-1rem)] truncate">
              {campaignName}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-0.5 p-2.5">
          {/* The stretched link makes the whole card clickable. */}
          <Link
            to={character.draft ? characterStartPath(character.id) : characterPath(character.id)}
            className="truncate font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-ring focus-visible:after:rounded-lg focus-visible:after:ring-2"
          >
            {character.name}
          </Link>
          <span className="text-muted-foreground truncate text-xs font-medium">{characterSubtitle(character, summary)}</span>
        </div>
      </div>
    </TiltCard>
  )
}
