import { css } from "@/lib/colour"
import type { BrushBiome } from "@/lib/biomes/biomes"
import type { SceneBackground } from "@/lib/map-scene"
import { themeFor } from "@/lib/map-theme"
import { tileUrl } from "@/lib/terrain-tiles"

const STROKE = "M7 14 C 18 4, 30 17, 41 8 S 50 8, 57 6"

// A short curl of brush in a biome's colour, filled with its ground texture. The
// colour shows until the texture is there.
export function MapBiomeStroke({ biome, background }: { biome: BrushBiome; background: SceneBackground }) {
  const theme = themeFor(background)
  const look = biome === "plains" ? { fill: theme.land.fill, ink: theme.ink } : theme.biomes[biome]
  const texture = tileUrl(biome === "plains" ? "land" : biome)
  const id = `stroke-${biome}`

  return (
    <svg viewBox="0 0 64 20" className="h-5 w-16 shrink-0" aria-hidden>
      {texture && (
        <defs>
          <pattern id={id} patternUnits="userSpaceOnUse" width="32" height="32">
            <image href={texture} width="32" height="32" />
          </pattern>
        </defs>
      )}
      <g fill="none" strokeLinecap="round">
        <path d={STROKE} stroke={css(look.ink)} strokeWidth="11" opacity="0.7" />
        <path d={STROKE} stroke={css(look.fill)} strokeWidth="9" />
        {texture && <path d={STROKE} stroke={`url(#${id})`} strokeWidth="9" />}
      </g>
    </svg>
  )
}
