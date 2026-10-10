import { CANVAS_PRESETS } from "@/lib/map-scene"
import type { MapScene } from "@/lib/map-scene"
import type { MapStyle } from "@/lib/map-style"
import { MapStyleSliders } from "./MapStyleSliders"

type Props = {
  canvas: MapScene["canvas"]
  style: MapStyle
  onPreviewStyle: (style: MapStyle) => void
  onCommitStyle: (style: MapStyle) => void
}

// The map itself: its canvas and how the land and the water look.
export function MapSettings({ canvas, style, onPreviewStyle, onCommitStyle }: Props) {
  return (
    <>
      <p className="text-muted-foreground text-xs">
        {CANVAS_PRESETS[canvas.preset].label} · {canvas.width} × {canvas.height} px
      </p>
      <MapStyleSliders style={style} onPreview={onPreviewStyle} onCommit={onCommitStyle} />
    </>
  )
}
