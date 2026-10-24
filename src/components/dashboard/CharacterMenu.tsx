import { useNavigate } from "react-router-dom"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { EllipsisIcon } from "@/components/icons/EllipsisIcon"
import { HandshakeIcon } from "@/components/icons/HandshakeIcon"
import { Trash2Icon } from "@/components/icons/Trash2Icon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  // The legal page's entry for the character's template, when it has one.
  aboutPath: string | null
  onDelete: () => void
}

// What can be done to the character as a whole.
export function CharacterMenu({ aboutPath, onDelete }: Props) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Character options">
          <HoverIcon icon={EllipsisIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {aboutPath && (
          <>
            <DropdownMenuItem onSelect={() => navigate(aboutPath)}>
              <HoverIcon icon={HandshakeIcon} />
              About this template
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <HoverIcon icon={Trash2Icon} />
          Delete character
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
