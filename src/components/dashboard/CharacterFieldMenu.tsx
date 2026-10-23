import { MoreHorizontal, Pin, PinOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SheetField } from "@/lib/character-sheet"

type Props = {
  field: SheetField
  pinned: boolean
  onPin: (pinned: boolean) => void
  onRemove: () => void
  className?: string
}

// What can be done to a field: show it in the header (numbers and boxes only), and for
// one the player added, take it away.
export function CharacterFieldMenu({ field, pinned, onPin, onRemove, className }: Props) {
  const pinnable =
    !field.derived &&
    (field.type === "stat" || field.type === "resource" || field.type === "track" || field.type === "toggle")
  if (!pinnable && !field.custom) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`size-7 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 data-[state=open]:opacity-100 group-hover/field:opacity-100 ${className ?? ""}`}
          aria-label={`${field.label} options`}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {pinnable && (
          <DropdownMenuItem onSelect={() => onPin(!pinned)}>
            {pinned ? <PinOff /> : <Pin />}
            {pinned ? "Remove from header" : "Show in header"}
          </DropdownMenuItem>
        )}
        {pinnable && field.custom && <DropdownMenuSeparator />}
        {field.custom && (
          <DropdownMenuItem variant="destructive" onSelect={onRemove}>
            <Trash2 />
            Remove field
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
