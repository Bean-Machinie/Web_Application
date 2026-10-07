import { STYLE_LIMITS } from "@/lib/map-style"
import type { MapStyle } from "@/lib/map-style"
import { SliderField } from "./SliderField"

type Props = {
  style: MapStyle
  onPreview: (style: MapStyle) => void
  onCommit: (style: MapStyle) => void
}

type Row = { key: keyof MapStyle; label: string; unit: string; scale?: number }

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Land",
    rows: [
      { key: "roundness", label: "Roundness", unit: "%", scale: 100 },
      { key: "outline", label: "Outline", unit: "px" },
    ],
  },
  {
    title: "Water",
    rows: [
      { key: "rings", label: "Rings", unit: "" },
      { key: "thickness", label: "Thickness", unit: "px" },
      { key: "spacing", label: "Spacing", unit: "px" },
      { key: "variation", label: "Variation", unit: "%", scale: 100 },
    ],
  },
]

// Sliders for how all the land and the water around it look, what is already
// drawn included.
export function MapStyleSliders({ style, onPreview, onCommit }: Props) {
  return (
    <>
      {GROUPS.map(({ title, rows }) => (
        <div key={title} className="grid gap-3">
          <h3 className="text-sm font-medium">{title}</h3>
          {rows.map(({ key, label, unit, scale }) => (
            <SliderField
              key={key}
              label={label}
              unit={unit}
              scale={scale}
              inline
              {...STYLE_LIMITS[key]}
              value={style[key]}
              onChange={(value) => onPreview({ ...style, [key]: value })}
              onCommit={(value) => onCommit({ ...style, [key]: value })}
            />
          ))}
        </div>
      ))}
    </>
  )
}
