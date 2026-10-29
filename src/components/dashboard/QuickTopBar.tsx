import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { EllipsisIcon } from "@/components/icons/EllipsisIcon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { SettingsIcon } from "@/components/icons/SettingsIcon"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SaveState } from "@/hooks/use-character"
import { characterBuildPath } from "@/lib/characters"
import { SaveIndicator } from "./SaveIndicator"

type Props = {
  name: string
  characterId: string
  saveState: SaveState
  ready: boolean
  creating: boolean
  onBack: () => void
  onRules: () => void
  onCreate: () => void
}

// Like the map builder's bar: back, the character's name, and at the far end the draft's
// state, a menu for Customize and the table rules, and the one thing to do, Create character.
export function QuickTopBar({ name, characterId, saveState, ready, creating, onBack, onRules, onCreate }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-3">
      <Button variant="ghost" size="icon" aria-label="Back" onClick={onBack}>
        <ArrowLeft />
      </Button>
      <h1 className="min-w-0 truncate font-medium">{name}</h1>
      <div className="ml-auto flex items-center gap-4">
        <SaveIndicator state={saveState} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More options">
              <HoverIcon icon={EllipsisIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={characterBuildPath(characterId, "class")}>Customize in the full builder</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onRules}>
              <HoverIcon icon={SettingsIcon} />
              Table rules
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* A disabled button gets no pointer events, so the tooltip hangs on its wrapper. */}
            <span tabIndex={ready ? -1 : 0}>
              <Button disabled={!ready || creating} onClick={onCreate}>Create character</Button>
            </span>
          </TooltipTrigger>
          {!ready && <TooltipContent align="end">Choose a class, a species and a background first.</TooltipContent>}
        </Tooltip>
      </div>
    </header>
  )
}
