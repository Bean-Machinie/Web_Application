import type { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useShortcutKeys } from "@/hooks/use-shortcut-keys"
import type { BrushBiome } from "@/lib/biomes/biomes"
import type { Detail } from "@/lib/details/details"
import type { SceneBackground } from "@/lib/map-scene"
import { BUILDER_TOOLS } from "@/lib/map-builder-tools"
import type { BuilderTool } from "@/lib/map-builder-tools"
import { MapBrushBadge } from "./MapBrushBadge"
import { MapDetailBadge } from "./MapDetailBadge"
import { MapToolIcon } from "./MapToolIcon"
import type { ToolModes } from "./MapToolIcon"

type Props = {
  tool: BuilderTool
  modes: ToolModes
  // What the brush paints, shown on its icon: a biome, with the ground it is painted on,
  // or when it is on the details tab, the detail.
  biome: BrushBiome
  detail: Detail | null
  background: SceneBackground
  disabled: boolean
  // At the foot, and widening over the tool panel when it is open.
  account: ReactNode
  onTool: (tool: BuilderTool) => void
}

// The narrow strip of tools down the left, each picked by clicking it or by
// its key. It is the width, colour and buttons of the dashboard's sidebar when it is put away
// (see ui/sidebar.tsx and NavMain): square 48 pixel buttons with 18 pixel icons, 4 apart.
export function MapToolStrip({ tool, modes, biome, detail, background, disabled, account, onTool }: Props) {
  const keysOf = useShortcutKeys()
  return (
    <nav
      aria-label="Tools"
      className={`bg-sidebar text-sidebar-foreground border-sidebar-border relative z-30 flex w-16 shrink-0 flex-col items-center gap-1 border-r px-2 py-2 ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      {BUILDER_TOOLS.map(({ id, label }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-active={tool === id}
              className="ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md outline-hidden focus-visible:ring-2 [&_svg]:size-[18px] [&_svg]:shrink-0"
              aria-label={label}
              aria-pressed={tool === id}
              onClick={() => onTool(id)}
            >
              <MapToolIcon tool={id} modes={modes} />
              {id === "brush" &&
                (detail ? <MapDetailBadge detail={detail} /> : <MapBrushBadge biome={biome} background={background} />)}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" keys={keysOf(`tool.${id}`)}>
            {label}
          </TooltipContent>
        </Tooltip>
      ))}
      {account}
    </nav>
  )
}
