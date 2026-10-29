import { useState } from "react"
import { Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UNTITLED_CHARACTER } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { suggestNames } from "@/lib/quick-names"
import type { SlotKind } from "@/lib/quick-slots"
import { ImageFieldEditor } from "./ImageFieldEditor"
import { SLOT_ICONS } from "./quick-icons"
import { QuickValue } from "./QuickValue"

type Props = {
  character: Character
  userId: string
  // The icon of the class chosen, or the species, until there is a portrait.
  iconKind: SlotKind
  speciesId: string | null
  line: string | null
  lineChanged: boolean
  onName: (name: string) => void
  onPortrait: (portrait: Character["portrait"]) => Promise<boolean>
}

// The top of the character card: the portrait, to upload or leave as the class icon, the
// name, and the line "Human Fighter · Soldier". The name is saved when the field is left.
export function QuickCardIdentity({ character, userId, iconKind, speciesId, line, lineChanged, onName, onPortrait }: Props) {
  const [name, setName] = useState(character.name === UNTITLED_CHARACTER ? "" : character.name)
  const Icon = SLOT_ICONS[iconKind]

  function save(next = name) {
    const trimmed = next.trim()
    if (trimmed !== "" && trimmed !== character.name) onName(trimmed)
  }

  function suggest() {
    const [suggested] = suggestNames(speciesId!, 1)
    setName(suggested)
    save(suggested)
  }

  return (
    <div className="flex items-start gap-3 min-[1000px]:w-full">
      <div className="[--image-size:5rem]">
        <ImageFieldEditor
          value={character.portrait}
          label="Portrait"
          fallback={<Icon className="size-8" strokeWidth={1.25} />}
          context={{ folder: userId, entryId: character.id }}
          onChange={(value) => onPortrait(value as Character["portrait"])}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex gap-1.5">
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
            <Button variant="outline" size="icon" aria-label="Suggest a name" onClick={suggest}>
              <Dices />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground -ml-1 text-sm">
          {line ? <QuickValue value={line} changed={lineChanged} /> : "Your story starts here"}
        </p>
      </div>
    </div>
  )
}
