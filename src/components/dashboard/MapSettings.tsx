import { Button } from "@/components/ui/button"
import { BACKGROUNDS, CANVAS_PRESETS } from "@/lib/map-scene"
import type { MapScene, SceneBackground } from "@/lib/map-scene"
import type { MapStyle } from "@/lib/map-style"
import { MapStyleSliders } from "./MapStyleSliders"

type Props = {
  canvas: MapScene["canvas"]
  style: MapStyle
  onBackground: (background: SceneBackground) => void
  onPreviewStyle: (style: MapStyle) => void
  onCommitStyle: (style: MapStyle) => void
}

// The map itself: its canvas, its background, and how the land and the water look.
export function MapSettings({ canvas, style, onBackground, onPreviewStyle, onCommitStyle }: Props) {
  return (
    <>
      <p className="text-muted-foreground text-xs">
        {CANVAS_PRESETS[canvas.preset].label} · {canvas.width} × {canvas.height} px
      </p>
      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Background</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(BACKGROUNDS) as SceneBackground[]).map((background) => (
            <Button
              key={background}
              variant={canvas.background === background ? "secondary" : "outline"}
              aria-pressed={canvas.background === background}
              onClick={() => onBackground(background)}
            >
              {BACKGROUNDS[background].label}
            </Button>
          ))}
        </div>
      </div>
      <MapStyleSliders style={style} onPreview={onPreviewStyle} onCommit={onCommitStyle} />
    </>
  )
}
