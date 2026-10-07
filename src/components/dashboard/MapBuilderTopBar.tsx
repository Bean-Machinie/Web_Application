import { AlertCircle, ArrowLeft, Check, Loader2, Redo2, Undo2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SceneSaveState } from "@/hooks/use-scene-autosave"

type Props = {
  name: string
  saveState: SceneSaveState
  unpublished: boolean
  publishing: boolean
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onBack: () => void
  onPublish: () => void
}

function status(state: SceneSaveState, unpublished: boolean) {
  if (state === "saving") return { Icon: Loader2, text: "Saving draft…", spin: true }
  if (state === "error" || state === "conflict") {
    return { Icon: AlertCircle, text: "Couldn't save the draft", spin: false }
  }
  return {
    Icon: Check,
    text: unpublished ? "Draft saved · not published" : "Published to players",
    spin: false,
  }
}

// Back to the map, undo and redo, the draft's state, and publishing. The draft
// saves by itself; only Publish changes the map image players see.
export function MapBuilderTopBar(props: Props) {
  const { Icon, text, spin } = status(props.saveState, props.unpublished)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-3">
      <Button variant="ghost" size="icon" aria-label="Back to the map" onClick={props.onBack}>
        <ArrowLeft />
      </Button>
      <h1 className="min-w-0 truncate font-medium">{props.name}</h1>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Undo"
          disabled={!props.canUndo}
          onClick={props.onUndo}
        >
          <Undo2 />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Redo"
          disabled={!props.canRedo}
          onClick={props.onRedo}
        >
          <Redo2 />
        </Button>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <span role="status" className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Icon className={`size-3.5 ${spin ? "animate-spin" : ""}`} />
          {text}
        </span>
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
