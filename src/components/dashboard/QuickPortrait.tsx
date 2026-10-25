import { useState } from "react"
import { User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UNTITLED_CHARACTER } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import { ImageFieldEditor } from "./ImageFieldEditor"

type Props = {
  character: Character
  userId: string
  onName: (name: string) => void
  onPortrait: (portrait: Character["portrait"]) => Promise<boolean>
}

// The right of the start page: the portrait, to upload or leave as a placeholder, and the
// name under it. The name is saved when the field is left.
export function QuickPortrait({ character, userId, onName, onPortrait }: Props) {
  const [name, setName] = useState(character.name === UNTITLED_CHARACTER ? "" : character.name)

  function save() {
    const trimmed = name.trim()
    if (trimmed !== "" && trimmed !== character.name) onName(trimmed)
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
        onBlur={save}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
      />
    </aside>
  )
}
