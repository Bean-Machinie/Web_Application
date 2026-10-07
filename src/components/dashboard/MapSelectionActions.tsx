import { Copy, FlipHorizontal2, FlipVertical2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import { Shortcut } from "./Shortcut"

function Action(props: { label: string; keys: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={props.label} onClick={props.onClick}>
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

// What can be done to the selected art, in a row under its size and turn.
export function MapSelectionActions({ editing }: { editing: AssetEditing }) {
  return (
    <div className="flex gap-1">
      <Action label="Flip horizontally" keys="Shift+H" onClick={() => editing.flip("x")}>
        <FlipHorizontal2 />
      </Action>
      <Action label="Flip vertically" keys="Shift+V" onClick={() => editing.flip("y")}>
        <FlipVertical2 />
      </Action>
      <Action label="Duplicate" keys="Ctrl+D" onClick={editing.duplicate}>
        <Copy />
      </Action>
      <Action label="Delete" keys="Del" onClick={editing.remove}>
        <Trash2 />
      </Action>
    </div>
  )
}
