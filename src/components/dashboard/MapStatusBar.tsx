import { Maximize, Minus, Plus } from "lucide-react"
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
import { Shortcut } from "./Shortcut"

const PRESETS = [0.25, 0.5, 1, 2, 4]

type Props = {
  // The view's scale: 1 is 100%.
  zoom: number
  onZoomBy: (factor: number) => void
  onZoomTo: (scale: number) => void
  onFit: () => void
}

function Step(props: { label: string; keys: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label={props.label} onClick={props.onClick}>
          {props.children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {props.label}
        <Shortcut>{props.keys}</Shortcut>
      </TooltipContent>
    </Tooltip>
  )
}

// The thin bar under the canvas: how far it is zoomed, as a percentage that
// opens a list of zooms to jump to, with the buttons to step and to fit.
export function MapStatusBar({ zoom, onZoomBy, onZoomTo, onFit }: Props) {
  return (
    <footer className="bg-background flex h-7 shrink-0 items-center justify-end gap-0.5 border-t px-2">
      <Step label="Fit canvas to view" keys="Ctrl+0" onClick={onFit}>
        <Maximize />
      </Step>
      <Step label="Zoom out" keys="Ctrl+−" onClick={() => onZoomBy(1 / 1.4)}>
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
            Fit <DropdownMenuShortcut>Ctrl+0</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {PRESETS.map((scale) => (
            <DropdownMenuItem key={scale} onSelect={() => onZoomTo(scale)}>
              {scale * 100}%
              {scale === 1 && <DropdownMenuShortcut>Ctrl+Alt+0</DropdownMenuShortcut>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Step label="Zoom in" keys="Ctrl++" onClick={() => onZoomBy(1.4)}>
        <Plus />
      </Step>
    </footer>
  )
}
