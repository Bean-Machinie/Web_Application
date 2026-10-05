import { Button } from "@/components/ui/button"
import { BACKGROUNDS, CANVAS_PRESETS } from "@/lib/map-scene"
import type { MapScene, SceneBackground } from "@/lib/map-scene"

type Props = {
  canvas: MapScene["canvas"]
  onBackground: (background: SceneBackground) => void
}

// The panel beside the canvas. For now it holds the canvas settings; the
// drawing tools will join it above.
export function MapBuilderSidebar({ canvas, onBackground }: Props) {
  const { label } = CANVAS_PRESETS[canvas.preset]

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-5 border-r p-4">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Canvas</h2>
        <p className="text-muted-foreground text-[13px] leading-snug">
          {label}, {canvas.width} × {canvas.height} px. The size is fixed, so pins on the map stay
          put when it is published again.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Background</h2>
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
      </section>
    </aside>
  )
}
