import { Link } from "react-router-dom"
import { User } from "lucide-react"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { PlusIcon } from "@/components/icons/PlusIcon"
import { TiltCard } from "@/components/TiltCard"
import { tiltCardSkin } from "@/components/tilt-card-styles"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { characterPath, characterStartPath } from "@/lib/characters"
import type { Character } from "@/lib/characters"

type Props = { characters: Character[] | null; query: string; onNew: () => void }

// The library's characters as cards, like its entries: the portrait, the name and the
// concept. The search above narrows them by name.
export function LibraryCharacters({ characters, query, onNew }: Props) {
  if (!characters) return <Skeleton className="h-40 w-full" />

  const text = query.trim().toLowerCase()
  const shown = text ? characters.filter((character) => character.name.toLowerCase().includes(text)) : characters

  if (shown.length === 0) {
    return (
      <Empty className="border py-12">
        <EmptyHeader>
          <EmptyTitle>{text ? "No matches" : "No characters yet"}</EmptyTitle>
        </EmptyHeader>
        {!text && (
          <Button variant="outline" onClick={onNew}>
            <HoverIcon icon={PlusIcon} />
            New character
          </Button>
        )}
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
      {shown.map((character) => (
        <TiltCard key={character.id} className={`group bg-card rounded-lg border ${tiltCardSkin()}`}>
          <div className="overflow-hidden rounded-[inherit]">
            <div className="bg-muted text-muted-foreground flex aspect-square items-center justify-center overflow-hidden">
              {character.portrait ? (
                <img src={character.portrait.url} alt="" loading="lazy" className="size-full object-cover" />
              ) : (
                <User className="size-10" />
              )}
            </div>
            <div className="flex flex-col gap-0.5 p-2.5">
              {/* The stretched link makes the whole card clickable. */}
              <Link
                to={character.draft ? characterStartPath(character.id) : characterPath(character.id)}
                className="truncate font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-ring focus-visible:after:rounded-lg focus-visible:after:ring-2"
              >
                {character.name}
              </Link>
              <span className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
                {character.draft && <Badge variant="secondary">Draft</Badge>}
                {character.concept || "Character"}
              </span>
            </div>
          </div>
        </TiltCard>
      ))}
    </div>
  )
}
