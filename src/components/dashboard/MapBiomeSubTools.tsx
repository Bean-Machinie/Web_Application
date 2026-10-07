import type { Brush } from "@/hooks/use-brush"
import { BIOMES } from "@/lib/biomes/biomes"
import type { BrushBiome } from "@/lib/biomes/biomes"
import type { SceneBackground } from "@/lib/map-scene"
import { MapBiomeStroke } from "./MapBiomeStroke"
import { MapSubToolButton } from "./MapSubToolButton"

const CHOICES: BrushBiome[] = ["plains", ...BIOMES]
const name = (biome: BrushBiome) => biome[0].toUpperCase() + biome.slice(1)

type Props = { brush: Brush; background: SceneBackground }

export function MapBiomeSubTools({ brush, background }: Props) {
  return (
    <>
      {CHOICES.map((biome) => (
        <MapSubToolButton
          key={biome}
          label={name(biome)}
          hint={biome === "plains" ? "Paint plains to clear any biome" : `Paint ${biome}`}
          active={brush.biome === biome}
          onClick={() => brush.onBiome(biome)}
        >
          <MapBiomeStroke biome={biome} background={background} />
        </MapSubToolButton>
      ))}
    </>
  )
}
