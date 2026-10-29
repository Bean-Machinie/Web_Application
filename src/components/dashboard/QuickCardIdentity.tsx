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

// The top of the character card: a wide portrait, to upload or leave as the class icon, with
// the name over its bottom edge, and the line "Human Barbarian · Sage" under it. The name is
// saved when the field is left.
export function QuickCardIdentity({ character, userId, iconKind, speciesId, line, lineChanged, onName, onPortrait }: Props) {
  const [name, setName] = useState(character.name === UNTITLED_CHARACTER ? "" : character.name)
  const Icon = SLOT_ICONS[iconKind]
  // A rename made in the top bar shows in this field too.
  const [seen, setSeen] = useState(character.name)
  if (seen !== character.name) {
    setSeen(character.name)
    setName(character.name === UNTITLED_CHARACTER ? "" : character.name)
  }

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
    <div className="flex flex-col gap-2">
      <div className="relative [--image-height:10rem] [--image-size:100%] max-[999px]:[--image-height:7rem]">
        <ImageFieldEditor
          value={character.portrait}
          label="Portrait"
          fallback={<Icon className="size-12" strokeWidth={1} />}
          context={{ folder: userId, entryId: character.id }}
          onChange={(value) => onPortrait(value as Character["portrait"])}
        />
        <div className="pointer-events-none absolute inset-x-px bottom-px flex gap-1.5 rounded-b-lg bg-gradient-to-t from-black/75 via-black/40 to-transparent p-2.5 pt-10">
          <Input
            value={name}
            maxLength={60}
            placeholder="Name your character"
            aria-label="Character name"
            className="pointer-events-auto border-white/25 bg-black/30 text-white placeholder:text-white/70"
            onChange={(event) => setName(event.target.value)}
            onBlur={() => save()}
            onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
          />
          {speciesId && (
            <Button variant="secondary" size="icon" aria-label="Suggest a name" className="pointer-events-auto" onClick={suggest}>
              <Dices />
            </Button>
          )}
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        {line ? <QuickValue value={line} changed={lineChanged} className="-ml-1" /> : "Your story starts here"}
      </p>
    </div>
  )
}
