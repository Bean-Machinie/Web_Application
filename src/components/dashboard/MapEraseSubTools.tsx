import type { Brush } from "@/hooks/use-brush"
import type { EraseTarget } from "@/lib/erase"
import { ERASE_ICONS } from "./map-erase-icons"
import { MapSubToolButton } from "./MapSubToolButton"

const ROWS: { target: EraseTarget; label: string; hint: string }[] = [
  { target: "biomes", label: "Erase biomes", hint: "Back to plains" },
  { target: "details", label: "Erase details", hint: "Keeps the biomes" },
  { target: "assets", label: "Erase assets", hint: "Removes whole assets" },
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
