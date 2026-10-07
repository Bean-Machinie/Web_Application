import { Copy, FlipHorizontal2, FlipVertical2, MinusSquare, PlusSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import type { Brush } from "@/hooks/use-brush"
import type { BuilderTool, LandMode } from "@/lib/map-builder-tools"
import type { SceneBackground } from "@/lib/map-scene"
import { MapBrushOptions } from "./MapBrushOptions"
import { Shortcut } from "./Shortcut"

type Props = {
  tool: BuilderTool
  mode: LandMode
  // Alt is held, which flips the land mode for as long as it is.
  altHeld: boolean
  editing: AssetEditing
  brush: Brush
  background: SceneBackground
  onMode: (mode: LandMode) => void
}

// The bar under the title, which changes with the tool: add or cut for land,
// what can be done to the selection for select.
export function MapOptionsBar({ tool, mode, altHeld, editing, brush, background, onMode }: Props) {
  const cutting = (mode === "cut") !== altHeld
  const some = editing.selected.length > 0

  const tip = (label: string, shortcut: string | null, button: React.ReactElement) => (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>
        {label}
        {shortcut && <Shortcut>{shortcut}</Shortcut>}
      </TooltipContent>
    </Tooltip>
  )

  return (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b px-3">
      {tool === "land" && (
        <>
          {tip(
            "Draw an outline to add land. Overlapping shapes merge.",
            "Alt switches",
            <Button
              variant={cutting ? "ghost" : "secondary"}
              size="sm"
              aria-pressed={!cutting}
              onClick={() => onMode("add")}
            >
              <PlusSquare /> Add land
            </Button>
          )}
          {tip(
            "Draw around land to cut it away: bays, lakes, straits.",
            "Alt switches",
            <Button
              variant={cutting ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={cutting}
              onClick={() => onMode("cut")}
            >
              <MinusSquare /> Cut land
            </Button>
          )}
        </>
      )}
      {tool === "select" && (
        <>
          {tip(
            "Flip horizontally",
            "Shift+H",
            <Button variant="ghost" size="icon-sm" aria-label="Flip horizontally" disabled={!some} onClick={() => editing.flip("x")}>
              <FlipHorizontal2 />
            </Button>
          )}
          {tip(
            "Flip vertically",
            "Shift+V",
            <Button variant="ghost" size="icon-sm" aria-label="Flip vertically" disabled={!some} onClick={() => editing.flip("y")}>
              <FlipVertical2 />
            </Button>
          )}
          <Separator orientation="vertical" className="mx-1 h-5" />
          {tip(
            "Duplicate",
            "Ctrl+D",
            <Button variant="ghost" size="icon-sm" aria-label="Duplicate" disabled={!some} onClick={editing.duplicate}>
              <Copy />
            </Button>
          )}
          {tip(
            "Delete",
            "Del",
            <Button variant="ghost" size="icon-sm" aria-label="Delete" disabled={!some} onClick={editing.remove}>
              <Trash2 />
            </Button>
          )}
          <span className="text-muted-foreground ml-2 text-xs">
            {some ? `${editing.selected.length} selected` : "Nothing selected"}
          </span>
        </>
      )}
      {(tool === "brush" || tool === "blend") && (
        <MapBrushOptions tool={tool} brush={brush} background={background} />
      )}
      {tool === "hand" && <span className="text-muted-foreground text-xs">Drag to move around</span>}
    </div>
  )
}
