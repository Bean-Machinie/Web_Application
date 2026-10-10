import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useShortcutText } from "@/hooks/use-shortcut-text"
import { BUILDER_TOOLS } from "@/lib/map-builder-tools"
import type { BuilderTool } from "@/lib/map-builder-tools"
import { Shortcut } from "./Shortcut"
import { MapToolIcon } from "./MapToolIcon"
import type { ToolModes } from "./MapToolIcon"

type Props = {
  tool: BuilderTool
  modes: ToolModes
  disabled: boolean
  onTool: (tool: BuilderTool) => void
}

// The narrow strip of tools down the left, each picked by clicking it or by
// its key.
export function MapToolStrip({ tool, modes, disabled, onTool }: Props) {
  const keyOf = useShortcutText()
  return (
    <nav
      aria-label="Tools"
      className={`flex w-12 shrink-0 flex-col items-center gap-1 border-r py-2 ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      {BUILDER_TOOLS.map(({ id, label }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <Button
              variant={tool === id ? "secondary" : "ghost"}
              size="icon-lg"
              aria-label={label}
              aria-pressed={tool === id}
              onClick={() => onTool(id)}
            >
              <MapToolIcon tool={id} modes={modes} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {label} <Shortcut>{keyOf(`tool.${id}`)}</Shortcut>
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  )
}
