import { Link } from "react-router-dom"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { SettingsIcon } from "@/components/icons/SettingsIcon"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SaveState } from "@/hooks/use-character"
import { characterBuildPath } from "@/lib/characters"
import { SaveIndicator } from "./SaveIndicator"

type Props = {
  characterId: string
  saveState: SaveState
  ready: boolean
  creating: boolean
  onRules: () => void
  onCreate: () => void
}

// The top of the start page: the title, and Saved, Customize, the table rules and Create character.
export function QuickTopBar({ characterId, saveState, ready, creating, onRules, onCreate }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Start your story</h1>
        <p className="text-muted-foreground text-sm">Finish the sentence to build your character.</p>
      </div>
      <div className="flex items-center gap-2">
        <SaveIndicator state={saveState} />
        <Button variant="ghost" asChild>
          <Link to={characterBuildPath(characterId, "class")}>Customize</Link>
        </Button>
        <Button variant="outline" size="icon" aria-label="Table rules" onClick={onRules}>
          <HoverIcon icon={SettingsIcon} />
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* A disabled button gets no pointer events, so the tooltip hangs on its wrapper. */}
            <span tabIndex={ready ? -1 : 0}>
              <Button disabled={!ready || creating} onClick={onCreate}>Create character</Button>
            </span>
          </TooltipTrigger>
          {!ready && <TooltipContent>Choose a class, a species and a background first.</TooltipContent>}
        </Tooltip>
      </div>
    </div>
  )
}
