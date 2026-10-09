import { ArrowLeft, Loader2, Redo2, Undo2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useShortcutText } from "@/hooks/use-shortcut-text"
import type { SaveStore } from "@/lib/scene-save-store"
import { MapSaveStatus } from "./MapSaveStatus"
import { Shortcut } from "./Shortcut"

type Props = {
  name: string
  // The draft's saving, which the status shows by itself.
  store: SaveStore
  publishing: boolean
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onBack: () => void
  onPublish: () => void
}

// Back to the map, undo and redo, the draft's state, and publishing. The draft
// saves by itself; only Publish changes the map image players see.
export function MapBuilderTopBar(props: Props) {
  const keyOf = useShortcutText()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-3">
      <Button variant="ghost" size="icon" aria-label="Back to the map" onClick={props.onBack}>
        <ArrowLeft />
      </Button>
      <h1 className="min-w-0 truncate font-medium">{props.name}</h1>
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Undo"
              disabled={!props.canUndo}
              onClick={props.onUndo}
            >
              <Undo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Undo<Shortcut>{keyOf("history.undo")}</Shortcut>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Redo"
              disabled={!props.canRedo}
              onClick={props.onRedo}
            >
              <Redo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Redo<Shortcut>{keyOf("history.redo")}</Shortcut>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <MapSaveStatus store={props.store} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={props.onPublish} disabled={props.publishing}>
              {props.publishing ? <Loader2 className="animate-spin" /> : <Upload />}
              Publish map
            </Button>
          </TooltipTrigger>
          <TooltipContent align="end">
            Renders the map and publishes it to players, replacing the image they see. Drafts
            save on their own.
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
