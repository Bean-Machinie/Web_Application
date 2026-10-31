import { UNTITLED_CHARACTER } from "@/lib/characters"
import type { Character } from "@/lib/characters"
import type { SlotKind } from "@/lib/quick-slots"
import { EditableTitle } from "./EditableTitle"
import { ImageFieldEditor } from "./ImageFieldEditor"
import { SLOT_ICONS } from "./quick-icons"
import { QuickValue } from "./QuickValue"

type Props = {
  character: Character
  userId: string
  // The icon of the class chosen, or the species, until there is a portrait.
  iconKind: SlotKind
  line: string | null
  lineChanged: boolean
  // In a panel whose height can be pulled: the portrait is as large a square as the panel's width
  // and height allow, centred, with the name under it across the panel.
  fit: boolean
  onName: (name: string) => void
  onPortrait: (portrait: Character["portrait"]) => Promise<boolean>
}

// What the name and its gap take of the height, which the portrait leaves.
const NAME_ROOM = "2.5rem"

// The top of the character card as one block: the portrait, always a square, with the line
// "Human Fighter · Soldier · Level 1" laid over its top left, wrapping onto a second line rather than
// being cut off when the portrait is small, and under it the name as a title that
// a click turns into a field, as wide as the panel.
export function QuickCardIdentity({ character, userId, iconKind, line, lineChanged, fit, onName, onPortrait }: Props) {
  const Icon = SLOT_ICONS[iconKind]
  const picture = (
    <div className="relative [--image-size:100%]">
      <ImageFieldEditor
        value={character.portrait}
        label="Portrait"
        fallback={<Icon className="size-16" strokeWidth={1} />}
        context={{ folder: userId, entryId: character.id }}
        onChange={(value) => onPortrait(value as Character["portrait"])}
      />
      <p className="pointer-events-none absolute top-2 left-2 max-w-[calc(100%-1rem)] rounded-md bg-black/55 px-2 py-1 text-xs leading-snug text-white backdrop-blur-sm">
        {line ? <QuickValue value={line} changed={lineChanged} className="-mx-1" /> : "Your story starts here"}
      </p>
    </div>
  )
  const title = (
    <EditableTitle
      large
      value={character.name === UNTITLED_CHARACTER ? "" : character.name}
      placeholder="Name your character"
      label="Character name"
      maxLength={60}
      onSave={async (name) => {
        onName(name)
        return true
      }}
    />
  )

  if (!fit) {
    return (
      <div className="flex flex-col gap-2">
        <div className="w-44">{picture}</div>
        {title}
      </div>
    )
  }
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-2 p-3 pb-3 [container-type:size]" style={{ "--side": `min(100cqw, calc(100cqh - ${NAME_ROOM}))` } as React.CSSProperties}>
      <div className="mx-auto w-[var(--side)] shrink-0">{picture}</div>
      {title}
    </div>
  )
}
