import {
  ClipboardPaste,
  Copy,
  CopyPlus,
  FlipHorizontal2,
  FlipVertical2,
  Scissors,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import { useShortcutText } from "@/hooks/use-shortcut-text"

// Where the menu was opened: on screen, on the canvas, and whether over art.
export type ContextSpot = {
  x: number
  y: number
  at: { x: number; y: number }
  onAsset: boolean
}

type Props = { spot: ContextSpot | null; editing: AssetEditing; onClose: () => void }

// The right-click menu. It is the app's own dropdown menu, opened at the
// pointer: over art it offers everything for the selection, and over empty
// canvas it offers paste, at that spot.
export function MapContextMenu({ spot, editing, onClose }: Props) {
  const keyOf = useShortcutText()
  return (
    <DropdownMenu open={spot !== null} onOpenChange={(open) => !open && onClose()}>
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden
          className="pointer-events-none fixed size-px"
          style={{ left: spot?.x ?? 0, top: spot?.y ?? 0 }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {spot?.onAsset && (
          <>
            <DropdownMenuItem onSelect={editing.cut}>
              <Scissors /> Cut <DropdownMenuShortcut>{keyOf("edit.cut")}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={editing.copy}>
              <Copy /> Copy <DropdownMenuShortcut>{keyOf("edit.copy")}</DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem disabled={!editing.canPaste} onSelect={() => editing.paste(spot?.at)}>
          <ClipboardPaste /> Paste <DropdownMenuShortcut>{keyOf("edit.paste")}</DropdownMenuShortcut>
        </DropdownMenuItem>
        {spot?.onAsset && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={editing.duplicate}>
              <CopyPlus /> Duplicate <DropdownMenuShortcut>{keyOf("edit.duplicate")}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editing.flip("x")}>
              <FlipVertical2 /> Flip horizontally
              <DropdownMenuShortcut>{keyOf("edit.flipH")}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editing.flip("y")}>
              <FlipHorizontal2 /> Flip vertically
              <DropdownMenuShortcut>{keyOf("edit.flipV")}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={editing.remove}>
              <Trash2 /> Delete <DropdownMenuShortcut>{keyOf("edit.delete")}</DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
