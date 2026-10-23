import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRESETS, presetSize } from "@/lib/map-shapes"
import type { PresetKey } from "@/lib/map-shapes"

type Props = {
  value: PresetKey | "custom"
  portrait: boolean
  onPick: (preset: PresetKey) => void
}

const ITEM = "rounded-md *:[span]:last:flex-1"

// The sizes worth starting from, each with its pixels at the right in the orientation they
// would be filled in. Made like the builder's category list: it opens just under its
// trigger at the trigger's width. "Custom" is what shows once a number is typed;
// choosing it changes nothing.
export function MapPresetSelect({ value, portrait, onPick }: Props) {
  return (
    <Select value={value} onValueChange={(next) => next !== "custom" && onPick(next as PresetKey)}>
      <SelectTrigger aria-label="Preset" className="w-full *:data-[slot=select-value]:w-full data-[size=default]:h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={2}
        align="start"
        className="w-(--radix-select-trigger-width) overflow-hidden shadow-lg"
      >
        <div className="p-1">
          {PRESETS.map((preset) => {
            const { width, height } = presetSize(preset.key, portrait)
            return (
              <SelectItem key={preset.key} value={preset.key} className={ITEM}>
                <span className="truncate">{preset.label}</span>
                <span className="text-muted-foreground ml-auto pl-3 text-xs tabular-nums">
                  {width} × {height}
                </span>
              </SelectItem>
            )
          })}
          <SelectSeparator />
          <SelectItem value="custom" className={ITEM}>
            <span className="truncate">Custom</span>
          </SelectItem>
        </div>
      </SelectContent>
    </Select>
  )
}
