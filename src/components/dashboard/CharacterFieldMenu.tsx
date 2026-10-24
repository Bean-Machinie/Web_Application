import { Pin, PinOff, SquareMinus, SquarePlus } from "lucide-react"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { EllipsisIcon } from "@/components/icons/EllipsisIcon"
import { Trash2Icon } from "@/components/icons/Trash2Icon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { trackLength } from "@/lib/character-sheet"
import type { SheetField } from "@/lib/character-sheet"

const MAX_LENGTH = 12

type Props = {
  field: SheetField
  pinned: boolean
  onPin: (pinned: boolean) => void
  // A track's number of boxes, changed here and not on the track itself.
  onLength: (length: number) => void
  onRemove: () => void
  className?: string
}

// What can be done to a field: show it in the header (numbers, boxes and toggles), add or
// take away a box of a track the player made, and, for a field the player added, remove
// it.
export function CharacterFieldMenu({ field, pinned, onPin, onLength, onRemove, className }: Props) {
  const pinnable =
    !field.derived &&
    (field.type === "stat" || field.type === "resource" || field.type === "track" || field.type === "toggle")
  const sizable = field.type === "track" && field.custom
  if (!pinnable && !field.custom) return null

  const length = trackLength(field)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`size-7 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 data-[state=open]:opacity-100 group-hover/field:opacity-100 ${className ?? ""}`}
          aria-label={`${field.label} options`}
        >
          <HoverIcon icon={EllipsisIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {pinnable && (
          <DropdownMenuItem onSelect={() => onPin(!pinned)}>
            {pinned ? <PinOff /> : <Pin />}
            {pinned ? "Remove from header" : "Show in header"}
          </DropdownMenuItem>
        )}
        {sizable && (
          <>
            <DropdownMenuItem disabled={length >= MAX_LENGTH} onSelect={() => onLength(length + 1)}>
              <SquarePlus />
              Add a box
            </DropdownMenuItem>
            <DropdownMenuItem disabled={length <= 1} onSelect={() => onLength(length - 1)}>
              <SquareMinus />
              Remove a box
            </DropdownMenuItem>
          </>
        )}
        {field.custom && <DropdownMenuSeparator />}
        {field.custom && (
          <DropdownMenuItem variant="destructive" onSelect={onRemove}>
            <HoverIcon icon={Trash2Icon} />
            Remove field
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
