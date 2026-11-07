import { useState } from "react"
import { FormAlert } from "@/components/auth/FormAlert"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { PlusIcon } from "@/components/icons/PlusIcon"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { useCharacterCards } from "@/hooks/use-character-cards"
import { CHARACTER_FILTERS, filterCharacters } from "@/lib/character-filter"
import type { CharacterFilter } from "@/lib/character-filter"
import { CardGrid } from "./CardGrid"
import { CharacterCards } from "./CharacterCards"
import { SectionHeading } from "./SectionHeading"
import { useNewCharacter } from "./useNewCharacter"

// Your characters as cards, narrowed by a segmented control. Create character opens the builder.
export function CharactersPage() {
  const { cards, error } = useCharacterCards()
  const [filter, setFilter] = useState<CharacterFilter>("all")
  const newCharacter = useNewCharacter()
  const shown = cards && filterCharacters(cards, filter)

  return (
    <div className="mx-auto flex w-[1104px] max-w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <SectionHeading>Characters</SectionHeading>
        <Button onClick={newCharacter.open}>
          <HoverIcon icon={PlusIcon} size={16} />
          Create character
        </Button>
      </div>

      {error && <FormAlert tone="error">{error}</FormAlert>}

      <div className="max-w-full overflow-x-auto self-start">
        <SegmentedControl value={filter} onValueChange={setFilter} options={CHARACTER_FILTERS} aria-label="Show characters" className="w-[28rem]" />
      </div>

      {!shown ? (
        <Skeleton className="h-40 w-full" />
      ) : shown.length === 0 ? (
        <Empty className="border border-dashed py-12">
          <EmptyHeader>
            <EmptyTitle>{cards?.length ? "No characters here" : "No characters yet"}</EmptyTitle>
            <EmptyDescription>{cards?.length ? "Try another filter." : "Create one to start building."}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <CardGrid>
          <CharacterCards items={shown} />
        </CardGrid>
      )}

      {newCharacter.dialog}
    </div>
  )
}
