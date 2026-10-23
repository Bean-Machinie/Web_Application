import { BACKGROUNDS } from "@/lib/map-scene"
import type { SceneBackground } from "@/lib/map-scene"
import { PreviewOption } from "./PreviewOption"

type Props = { value: SceneBackground; onChange: (value: SceneBackground) => void }

// Sea, land and coast as the builder starts them (see themeFor in map-theme.ts); these
// are only the sample, so they are written out here.
const SAMPLES: Record<SceneBackground, { sea: string; land: string; coast: string }> = {
  parchment: { sea: "rgb(239 227 189)", land: "rgb(239 227 189)", coast: "rgb(52 38 26)" },
  ocean: { sea: "rgb(30 84 112)", land: "rgb(129 119 80)", coast: "rgb(34 34 30)" },
}

// What the map is painted on, as a small picture of an island on it.
export function MapBackgroundChoice({ value, onChange }: Props) {
  const backgrounds = Object.keys(BACKGROUNDS) as SceneBackground[]

  return (
    <div role="radiogroup" aria-label="Background" className="flex gap-2">
      {backgrounds.map((background) => {
        const { sea, land, coast } = SAMPLES[background]
        return (
          <PreviewOption
            key={background}
            label={BACKGROUNDS[background].label}
            selected={background === value}
            onSelect={() => onChange(background)}
          >
            <svg viewBox="0 0 96 56" className="h-14 w-24 rounded-[3px] border" aria-hidden>
              <rect width="96" height="56" fill={sea} />
              <path
                d="M22 38c-4-10 2-22 14-24 10-2 14 4 24 2 12-2 18 8 14 18-3 8-12 8-20 6-9-2-12 6-22 4-5-1-8-3-10-6z"
                fill={land}
                stroke={coast}
                strokeWidth="1.5"
              />
            </svg>
          </PreviewOption>
        )
      })}
    </div>
  )
}
