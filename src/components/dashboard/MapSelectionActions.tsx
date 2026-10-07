import { Copy, FlipHorizontal2, FlipVertical2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import { useShortcutText } from "@/hooks/use-shortcut-text"
import type { ActionId } from "@/lib/shortcut-actions"
import { Shortcut } from "./Shortcut"

function Action(props: { label: string; action: ActionId; onClick: () => void; children: React.ReactNode }) {
  const keyOf = useShortcutText()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={props.label} onClick={props.onClick}>
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

// What can be done to the selected art, in a row under its size and turn.
export function MapSelectionActions({ editing }: { editing: AssetEditing }) {
  return (
    <div className="flex gap-1">
      <Action label="Flip horizontally" action="edit.flipH" onClick={() => editing.flip("x")}>
        <FlipVertical2 />
      </Action>
      <Action label="Flip vertically" action="edit.flipV" onClick={() => editing.flip("y")}>
        <FlipHorizontal2 />
      </Action>
      <Action label="Duplicate" action="edit.duplicate" onClick={editing.duplicate}>
        <Copy />
      </Action>
      <Action label="Delete" action="edit.delete" onClick={editing.remove}>
        <Trash2 />
      </Action>
    </div>
  )
}
