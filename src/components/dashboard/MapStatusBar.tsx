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
import type { ActionId } from "@/lib/shortcut-actions"
import { Shortcut } from "./Shortcut"

const PRESETS = [0.25, 0.5, 1, 2, 4]

type Props = {
  // The view's scale: 1 is 100%.
  zoom: number
  onZoomBy: (factor: number) => void
  onZoomTo: (scale: number) => void
  onFit: () => void
  onHelp: () => void
}

function Step(props: { label: string; action: ActionId; onClick: () => void; children: React.ReactNode }) {
  const keyOf = useShortcutText()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label={props.label} onClick={props.onClick}>
          {props.children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {props.label}
        <Shortcut>{keyOf(props.action)}</Shortcut>
      </TooltipContent>
    </Tooltip>
  )
}

// The thin bar under the canvas: how far it is zoomed, as a percentage that
// opens a list of zooms to jump to, with the buttons to step and to fit.
export function MapStatusBar({ zoom, onZoomBy, onZoomTo, onFit, onHelp }: Props) {
  const keyOf = useShortcutText()
  return (
    <footer className="bg-background flex h-7 shrink-0 items-center gap-0.5 border-t px-2">
      <Step label="Keyboard shortcuts" action="help.toggle" onClick={onHelp}>
        <Keyboard />
      </Step>
      <span className="flex-1" />
      <Step label="Fit canvas to view" action="view.fit" onClick={onFit}>
        <Maximize />
      </Step>
      <Step label="Zoom out" action="view.zoomOut" onClick={() => onZoomBy(1 / 1.4)}>
        <Minus />
      </Step>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="xs" aria-label="Zoom" className="w-14 tabular-nums">
            {Math.round(zoom * 100)}%
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
      <Step label="Zoom in" action="view.zoomIn" onClick={() => onZoomBy(1.4)}>
        <Plus />
      </Step>
    </footer>
  )
}
