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
  // The pinned fields as pills, or none.
  pills: ReactNode
  // The template's identity rows, as a card.
  identity: ReactNode
  // The save state and the menu, at the top right.
  aside: ReactNode
}

// The profile column: the portrait, the name, a line on the concept, the pinned fields as
// pills and the identity rows. From 1000px it is a 300px column beside the sheet, that
// stays on screen with a portrait as wide as the column; below that it is above the sheet,
// with a small portrait beside the name. The portrait's files are kept under the owner's
// folder in the images bucket, which the existing storage rule lets them write.
export function CharacterProfile({ character, userId, fresh, onName, onConcept, onPortrait, pills, identity, aside }: Props) {
  return (
    <aside className="relative flex w-full flex-col gap-4 min-[1000px]:sticky min-[1000px]:top-[calc(var(--header-height)+1.5rem)] min-[1000px]:w-[300px] min-[1000px]:shrink-0">
      <div className="flex items-start gap-4 min-[1000px]:flex-col">
        <div className="shrink-0 [--image-size:6rem] min-[1000px]:[--image-size:300px]">
          <ImageFieldEditor
            value={character.portrait}
            label="Portrait"
            fallback={<User className="size-8 min-[1000px]:size-16" />}
            context={{ folder: userId, entryId: character.id }}
            onChange={(value) => onPortrait(value as Character["portrait"])}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-20 min-[1000px]:w-full min-[1000px]:flex-none min-[1000px]:pr-0">
          <EditableName name={character.name} onSave={onName} autoEdit={fresh} />
          <InlineText
            value={character.concept}
            placeholder="Add a one-line concept"
            maxLength={140}
            allowEmpty
            onSave={onConcept}
            className="text-muted-foreground"
          />
        </div>
      </div>
      {pills && <div className="flex flex-wrap gap-2">{pills}</div>}
      {identity}
      <div className="absolute top-0 right-0 flex items-center gap-2 min-[1000px]:bg-background/80 min-[1000px]:rounded-md min-[1000px]:p-1 min-[1000px]:backdrop-blur-sm">
        {aside}
      </div>
    </aside>
  )
}
