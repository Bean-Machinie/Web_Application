import { Link } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { characterStartPath } from "@/lib/characters"
import { pickKeyOf } from "@/lib/pick-info"
import type { SheetActions } from "./character-actions"

// "Suggested" beside a value the quick build filled in, with Change in its menu, which opens
// its panel in the builder. It is gone once the player chooses.
export function SuggestedMarker({ markerKey, actions }: { markerKey: string; actions: SheetActions }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Suggested value, open menu"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 rounded-full border px-1.5 text-[10px] leading-4 outline-none focus-visible:ring-2"
        >
          Suggested
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`${characterStartPath(actions.characterId)}?pick=${pickKeyOf(markerKey)}`}>Change</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
