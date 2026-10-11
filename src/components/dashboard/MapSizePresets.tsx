import { useMemo } from "react"
import { dotShare, sizePresets } from "@/lib/brush-presets"

// The room a dot has, in pixels: the largest preset fills it.
const DOT_ROOM = 22

type Props = {
  size: number
  min: number
  max: number
  onPick: (size: number) => void
}

// A dozen sizes in two rows of six, each a dot with its number under it. The dots
// grow from preset to preset on the curve the sizes are spread on, and the one that
// is the brush's size now is lit.
export function MapSizePresets({ size, min, max, onPick }: Props) {
  const presets = useMemo(() => sizePresets(min, max), [min, max])

  return (
    <div role="group" aria-label="Preset sizes" className="grid grid-cols-6 gap-0.5">
      {presets.map((preset) => {
        const lit = preset === size
        const across = Math.max(Math.round(dotShare(preset, min, max) * DOT_ROOM), 4)
        return (
          <button
            key={preset}
            type="button"
            aria-label={`${preset} px`}
            aria-pressed={lit}
            onClick={() => onPick(preset)}
            className={`flex flex-col items-center gap-1 rounded-md px-0 pt-1.5 pb-1 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring ${
              lit ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center" style={{ height: DOT_ROOM, width: DOT_ROOM }}>
              <span
                className={`rounded-full transition-colors ${lit ? "bg-foreground" : "bg-current opacity-70"}`}
                style={{ height: across, width: across }}
              />
            </span>
            <span className="text-[10px] leading-none tabular-nums">{preset}</span>
          </button>
        )
      })}
    </div>
  )
}
