import { Button } from "@/components/ui/button"
import { BACKGROUNDS, CANVAS_PRESETS } from "@/lib/map-scene"
import type { MapScene, SceneBackground } from "@/lib/map-scene"
import { OptionButtons } from "./OptionButtons"

export type BuilderTool = "hand" | "land"
export type LandMode = "add" | "cut"

type Props = {
  canvas: MapScene["canvas"]
  tool: BuilderTool
  mode: LandMode
  // Alt is held, which flips the land mode for as long as it is.
  altHeld: boolean
  disabled: boolean
  onTool: (tool: BuilderTool) => void
  onMode: (mode: LandMode) => void
  onBackground: (background: SceneBackground) => void
}

// The panel beside the canvas: the tools, then the canvas settings.
export function MapBuilderSidebar(props: Props) {
  const { canvas, tool, mode, altHeld, disabled } = props
  const { label } = CANVAS_PRESETS[canvas.preset]
  const cutting = (mode === "cut") !== altHeld

  return (
    <aside
      className={`flex w-60 shrink-0 flex-col gap-5 border-r p-4 ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Tools</h2>
        <OptionButtons
          label="Tool"
          value={tool}
          options={[
            { value: "hand", label: "Pan" },
            { value: "land", label: "Land" },
          ]}
          onChange={props.onTool}
        />
        {tool === "land" && (
          <>
            <OptionButtons
              label="Land mode"
              value={mode}
              options={[
                { value: "add", label: "Add land" },
                { value: "cut", label: "Cut land" },
              ]}
              onChange={props.onMode}
            />
            <p className="text-muted-foreground text-[13px] leading-snug">
              {cutting
                ? "Draw around land to cut it away: bays, lakes and straits."
                : "Hold and draw an outline, then let go. Overlapping shapes merge."}{" "}
              Hold Alt to switch.
            </p>
          </>
        )}
        <p className="text-muted-foreground text-xs">Drag with the middle mouse button to pan while drawing.</p>
      </section>
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
              onClick={() => props.onBackground(background)}
            >
              {BACKGROUNDS[background].label}
            </Button>
          ))}
        </div>
      </section>
    </aside>
  )
}
