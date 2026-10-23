import type { ReactNode } from "react"
import { User } from "lucide-react"
import type { Character } from "@/lib/characters"
import { EditableName } from "./EditableName"
import { ImageFieldEditor } from "./ImageFieldEditor"
import { InlineText } from "./InlineText"

type Props = {
  character: Character
  userId: string
  // Just made: the name opens ready to be typed over.
  fresh: boolean
  onName: (name: string) => Promise<void>
  onConcept: (concept: string) => void
  onPortrait: (portrait: Character["portrait"]) => Promise<boolean>
  // The pills of pinned fields, and the save state and menu at the right.
  pills: ReactNode
  aside: ReactNode
}

// The top of the sheet: the portrait, the name, a line on the concept and the pinned
// resources as pills. The portrait's files are kept under the owner's folder in the
// images bucket, which the existing storage rule lets them write.
export function CharacterHeader({ character, userId, fresh, onName, onConcept, onPortrait, pills, aside }: Props) {
  return (
    <div className="flex items-start gap-4">
      <div className="[--image-size:6rem]">
        <ImageFieldEditor
          value={character.portrait}
          label="Portrait"
          fallback={<User className="size-8" />}
          context={{ folder: userId, entryId: character.id }}
          onChange={(value) => onPortrait(value as Character["portrait"])}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <EditableName name={character.name} onSave={onName} autoEdit={fresh} />
        <InlineText
          value={character.concept}
          placeholder="Add a one-line concept"
          maxLength={140}
          allowEmpty
          onSave={onConcept}
          className="text-muted-foreground"
        />
        {pills && <div className="flex flex-wrap gap-2 pt-1">{pills}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-3 pt-1.5">{aside}</div>
    </div>
  )
}
