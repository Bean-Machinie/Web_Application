import { useShortcutKeys } from "@/hooks/use-shortcut-keys"
import type { BrushBiome } from "@/lib/biomes/biomes"
import type { Detail } from "@/lib/details/details"
import type { SceneBackground } from "@/lib/map-scene"
import { BUILDER_TOOLS } from "@/lib/map-builder-tools"
import type { BuilderTool } from "@/lib/map-builder-tools"
import { BuilderRailButton } from "./BuilderRailButton"
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
  onTool: (tool: BuilderTool) => void
}

// The tools for the builder's rail, each picked by clicking it or by its key. They are the buttons
// of the dashboard's sidebar when it is put away (see ui/sidebar.tsx and NavMain): square 48 pixel
// buttons with 18 pixel icons, 4 apart.
export function MapToolButtons({ tool, modes, biome, detail, background, onTool }: Props) {
  const keysOf = useShortcutKeys()
  return (
    <>
      {BUILDER_TOOLS.map(({ id, label }) => (
        <BuilderRailButton key={id} label={label} active={tool === id} keys={keysOf(`tool.${id}`)} onClick={() => onTool(id)}>
          <MapToolIcon tool={id} modes={modes} />
          {id === "brush" &&
            (detail ? <MapDetailBadge detail={detail} /> : <MapBrushBadge biome={biome} background={background} />)}
        </BuilderRailButton>
      ))}
    </>
  )
}
