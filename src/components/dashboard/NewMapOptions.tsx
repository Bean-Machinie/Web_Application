import { Label } from "@/components/ui/label"
import { BACKGROUNDS, CANVAS_PRESETS } from "@/lib/map-scene"
import type { CanvasChoice, CanvasPreset, SceneBackground } from "@/lib/map-scene"
import { OptionButtons } from "./OptionButtons"

export type NewMapChoice = { source: "upload" | "build" } & CanvasChoice

export const DEFAULT_MAP_CHOICE: NewMapChoice = {
  source: "upload",
  preset: "3:2",
  background: "parchment",
}

type Props = { value: NewMapChoice; onChange: (value: NewMapChoice) => void }

const keys = <T extends string>(record: Record<T, unknown>) => Object.keys(record) as T[]

// What the creating of a map asks beyond its name: an image to upload later,
// or a canvas to build on, and for a canvas its shape and background.
export function NewMapOptions({ value, onChange }: Props) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>How do you want to make it?</Label>
        <OptionButtons
          label="How to make the map"
          value={value.source}
          options={[
            { value: "upload", label: "Upload image" },
            { value: "build", label: "Build map" },
          ]}
          onChange={(source) => onChange({ ...value, source })}
        />
      </div>
      {value.source === "build" && (
        <>
          <div className="grid gap-2">
            <Label>Canvas shape</Label>
            <OptionButtons<CanvasPreset>
              label="Canvas shape"
              value={value.preset}
              options={keys(CANVAS_PRESETS).map((preset) => ({
                value: preset,
                label: CANVAS_PRESETS[preset].label,
              }))}
              onChange={(preset) => onChange({ ...value, preset })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Background</Label>
            <OptionButtons<SceneBackground>
              label="Background"
              value={value.background}
              options={keys(BACKGROUNDS).map((background) => ({
                value: background,
                label: BACKGROUNDS[background].label,
              }))}
              onChange={(background) => onChange({ ...value, background })}
            />
          </div>
        </>
      )}
    </div>
  )
}
