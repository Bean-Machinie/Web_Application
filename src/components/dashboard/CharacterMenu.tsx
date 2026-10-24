import { HoverIcon } from "@/components/icons/HoverIcon"
import { EllipsisIcon } from "@/components/icons/EllipsisIcon"
import { Trash2Icon } from "@/components/icons/Trash2Icon"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// What can be done to the character as a whole.
export function CharacterMenu({ onDelete }: { onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Character options">
          <HoverIcon icon={EllipsisIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <HoverIcon icon={Trash2Icon} />
          Delete character
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
