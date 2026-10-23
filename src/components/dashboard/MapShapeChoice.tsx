import { CANVAS_PRESETS } from "@/lib/map-scene"
import type { CanvasPreset } from "@/lib/map-scene"
import { PreviewOption } from "./PreviewOption"

type Props = { value: CanvasPreset; onChange: (value: CanvasPreset) => void }

// The canvas shapes a map can start with, each drawn at its own proportions.
export function MapShapeChoice({ value, onChange }: Props) {
  const presets = Object.keys(CANVAS_PRESETS) as CanvasPreset[]

  return (
    <div role="radiogroup" aria-label="Canvas shape" className="flex gap-2">
      {presets.map((preset) => {
        const { width, height, label } = CANVAS_PRESETS[preset]
        return (
          <PreviewOption key={preset} label={label.split(" ").pop()!} selected={preset === value} onSelect={() => onChange(preset)}>
            <div className="flex h-14 items-center">
              <div
                className="bg-muted-foreground/25 border-muted-foreground/50 rounded-[3px] border"
                style={{ aspectRatio: `${width} / ${height}`, width: width > height ? "4.25rem" : "3.25rem" }}
              />
            </div>
          </PreviewOption>
        )
      })}
    </div>
  )
}
