import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { STYLE_LIMITS } from "@/lib/map-style"
import type { MapStyle } from "@/lib/map-style"

type Props = {
  style: MapStyle
  onPreview: (style: MapStyle) => void
  onCommit: (style: MapStyle) => void
}

type Row = { key: keyof MapStyle; label: string; show: (value: number) => string }

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Land",
    rows: [
      { key: "roundness", label: "Coastline roundness", show: (value) => `${Math.round(value * 100)}%` },
      { key: "outline", label: "Outline thickness", show: (value) => `${value} px` },
    ],
  },
  {
    title: "Water",
    rows: [
      { key: "rings", label: "Rings", show: String },
      { key: "spacing", label: "Ring spacing", show: (value) => `${value} px` },
      { key: "waviness", label: "Waviness", show: (value) => `${Math.round(value * 100)}%` },
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
          <h2 className="text-sm font-medium">{title}</h2>
          {rows.map(({ key, label, show }) => (
            <div key={key} className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`style-${key}`}>{label}</Label>
                <span className="text-muted-foreground text-xs tabular-nums">{show(style[key])}</span>
              </div>
              <Slider
                id={`style-${key}`}
                {...STYLE_LIMITS[key]}
                value={[style[key]]}
                onValueChange={([value]) => onPreview({ ...style, [key]: value })}
                onValueCommit={([value]) => onCommit({ ...style, [key]: value })}
              />
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
