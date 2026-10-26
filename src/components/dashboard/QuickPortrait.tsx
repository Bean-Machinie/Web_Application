import { useState } from "react"
import { Dices, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UNTITLED_CHARACTER } from "@/lib/characters"
import { suggestNames } from "@/lib/quick-names"
import type { Character } from "@/lib/characters"
import type { SheetActions } from "./character-actions"
import { ImageFieldEditor } from "./ImageFieldEditor"
import { QuickLanguages } from "./QuickLanguages"

type Props = {
  character: Character
  userId: string
  actions: SheetActions
  // Once chosen, names to suggest and languages to go with it.
  speciesId: string | null
  onName: (name: string) => void
  onPortrait: (portrait: Character["portrait"]) => Promise<boolean>
}

// The right of the start page: the portrait, to upload or leave as a placeholder, and the
// name under it. The name is saved when the field is left.
export function QuickPortrait({ character, userId, actions, speciesId, onName, onPortrait }: Props) {
  const [name, setName] = useState(character.name === UNTITLED_CHARACTER ? "" : character.name)

  const [names, setNames] = useState<{ species: string | null; list: string[] }>({ species: null, list: [] })
  const roll = () => setNames({ species: speciesId, list: speciesId ? suggestNames(speciesId) : [] })
  // Rolled when the species is chosen or changes, not on every render.
  if (names.species !== speciesId) roll()

  function save(next = name) {
    const trimmed = next.trim()
    if (trimmed !== "" && trimmed !== character.name) onName(trimmed)
  }

  function pick(suggested: string) {
    setName(suggested)
    save(suggested)
  }

  return (
    <aside className="flex flex-col gap-3 min-[900px]:w-[260px] min-[900px]:shrink-0">
      <div className="[--image-size:100%] min-[900px]:[--image-size:260px]">
        <ImageFieldEditor
          value={character.portrait}
          label="Portrait"
          fallback={<User className="size-14" />}
          context={{ folder: userId, entryId: character.id }}
          onChange={(value) => onPortrait(value as Character["portrait"])}
        />
      </div>
      <Input
        value={name}
        maxLength={60}
        placeholder="Name your character"
        aria-label="Character name"
        onChange={(event) => setName(event.target.value)}
        onBlur={() => save()}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
      />
      {speciesId && (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button variant="outline" size="icon-sm" aria-label="Suggest other names" onClick={roll}>
              <Dices />
            </Button>
            {names.list.map((suggested) => (
              <Button key={suggested} variant="ghost" size="sm" onClick={() => pick(suggested)}>{suggested}</Button>
            ))}
          </div>
          <QuickLanguages actions={actions} speciesId={speciesId} />
        </>
      )}
    </aside>
  )
}
