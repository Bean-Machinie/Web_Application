import { Keyboard, Maximize, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useShortcutText } from "@/hooks/use-shortcut-text"
import type { BuilderView } from "@/lib/view-matrix"
import { MapStepButton } from "./MapStepButton"

const PRESETS = [0.25, 0.5, 1, 2, 4]

type Props = {
  view: BuilderView
  onZoomBy: (factor: number) => void
  onZoomTo: (scale: number) => void
  onFit: () => void
  onResetTurn: () => void
  onHelp: () => void
}

// The thin bar under the canvas: how far it is zoomed, as a percentage that
// opens a list of zooms to jump to, with the buttons to step and to fit; and, when
// the view is turned or mirrored, how, which a click puts straight.
export function MapStatusBar({ view, onZoomBy, onZoomTo, onFit, onResetTurn, onHelp }: Props) {
  const keyOf = useShortcutText()
  const turned = Math.round(view.rotation) !== 0
  const flipped = view.flipH || view.flipV
  const flips = [view.flipH && "horizontally", view.flipV && "vertically"].filter(Boolean).join(" and ")
  return (
    <footer className="bg-background flex h-7 shrink-0 items-center gap-0.5 border-t px-2">
      <MapStepButton label="Keyboard shortcuts" action="help.toggle" onClick={onHelp}>
        <Keyboard />
      </MapStepButton>
      <span className="flex-1" />
      {(turned || flipped) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="xs" onClick={onResetTurn} className="text-muted-foreground tabular-nums">
              {turned && `${Math.round(view.rotation)}°`}
              {flipped && "Flipped"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {[turned && `Turned ${Math.round(view.rotation)}°`, flipped && `Flipped ${flips}`].filter(Boolean).join(", ")}
            . Click to reset
          </TooltipContent>
        </Tooltip>
      )}
      <MapStepButton label="Fit canvas to view" action="view.fit" onClick={onFit}>
        <Maximize />
      </MapStepButton>
      <MapStepButton label="Zoom out" action="view.zoomOut" onClick={() => onZoomBy(1 / 1.4)}>
        <Minus />
      </MapStepButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="xs" aria-label="Zoom" className="w-14 tabular-nums">
            {Math.round(view.scale * 100)}%
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-44">
          <DropdownMenuItem onSelect={onFit}>
            Fit <DropdownMenuShortcut>{keyOf("view.fit")}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {PRESETS.map((scale) => (
            <DropdownMenuItem key={scale} onSelect={() => onZoomTo(scale)}>
              {scale * 100}%
              {scale === 1 && <DropdownMenuShortcut>{keyOf("view.zoom100")}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <MapStepButton label="Zoom in" action="view.zoomIn" onClick={() => onZoomBy(1.4)}>
        <Plus />
      </MapStepButton>
    </footer>
  )
}
