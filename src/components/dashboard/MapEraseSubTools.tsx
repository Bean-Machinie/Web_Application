import type { Brush } from "@/hooks/use-brush"
import type { EraseTarget } from "@/lib/erase"
import { ERASE_ICONS } from "./map-erase-icons"
import { MapSubToolButton } from "./MapSubToolButton"

const ROWS: { target: EraseTarget; label: string; hint: string }[] = [
  { target: "biomes", label: "Erase biomes", hint: "Paint back to plains" },
  { target: "details", label: "Erase details", hint: "Rub out paths, roads and water; the biomes stay" },
  { target: "assets", label: "Erase assets", hint: "Remove any art the brush touches, whole" },
]

export function MapEraseSubTools({ brush }: { brush: Brush }) {
  return (
    <>
      {ROWS.map(({ target, label, hint }) => {
        const Icon = ERASE_ICONS[target]
        return (
          <MapSubToolButton
            key={target}
            label={label}
            hint={hint}
            active={brush.erase === target}
            onClick={() => brush.onErase(target)}
          >
            <Icon />
          </MapSubToolButton>
        )
      })}
    </>
  )
}
