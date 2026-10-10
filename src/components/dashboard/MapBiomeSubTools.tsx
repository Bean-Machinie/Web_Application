import type { Brush } from "@/hooks/use-brush"
import { useBiomePreviews } from "@/hooks/use-biome-previews"
import { BIOMES } from "@/lib/biomes/biomes"
import type { BrushBiome } from "@/lib/biomes/biomes"
import type { SceneBackground } from "@/lib/map-scene"
import { MapSubToolButton } from "./MapSubToolButton"

const CHOICES: BrushBiome[] = ["plains", ...BIOMES]
const name = (biome: BrushBiome) => biome[0].toUpperCase() + biome.slice(1)

type Props = { brush: Brush; background: SceneBackground }

export function MapBiomeSubTools({ brush, background }: Props) {
  const previews = useBiomePreviews(background)

  return (
    <>
      {CHOICES.map((biome) => (
        <MapSubToolButton
          key={biome}
          tall
          label={name(biome)}
          detail={biome === "plains" ? "Clears biomes" : undefined}
          hint={biome === "plains" ? "Paint plains to clear any biome" : `Paint ${biome}`}
          active={brush.biome === biome}
          onClick={() => brush.onBiome(biome)}
        >
          {/* Its place is kept until the picture is there. */}
          <span className="h-[30px] w-[120px] shrink-0">
            {previews && <img src={previews[biome]} alt="" draggable={false} className="size-full object-contain object-left" />}
          </span>
        </MapSubToolButton>
      ))}
    </>
  )
}
