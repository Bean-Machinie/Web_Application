import { useState } from "react"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { TiltCard } from "@/components/TiltCard"
import { HomeTilt } from "./HomeTilt"

type Props = {
  name: string
  description: string
  icon: LucideIcon
  // The art filling the tile.
  image: string | null
  onOpen: () => void
  // What plays over the art while the tile is hovered or focused; `roll` is new each time.
  effect?: (state: { active: boolean; roll: number }) => ReactNode
}

// One tool of the Create row: a perfect square of art with its name and a line under it on a soft
// gradient. Hover or focus plays the tool's own effect and leans the tile toward the cursor. With
// reduced motion only the border lights.
export function HomeToolTile({ name, description, icon: ToolIcon, image, onOpen, effect }: Props) {
  const reduced = useReducedMotion()
  const [state, setState] = useState({ active: false, roll: 1 })
  const on = () => setState({ active: true, roll: 1 + Math.floor(Math.random() * 20) })
  const off = () => setState((current) => ({ ...current, active: false }))

  return (
    <TiltCard className="block">
      <HomeTilt>
        <button
          type="button"
          onClick={onOpen}
          onPointerEnter={on}
          onPointerLeave={off}
          onFocus={on}
          onBlur={off}
          className="bg-muted hover:border-primary focus-visible:border-primary hover:ring-primary focus-visible:ring-primary relative block aspect-square w-full overflow-hidden rounded-lg border text-left outline-none transition-[border-color,box-shadow] duration-200 hover:ring-1 focus-visible:ring-1"
        >
          {image && <img src={image} alt="" className="size-full object-cover" />}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          {!reduced && effect?.(state)}
          <span className="absolute right-3 bottom-3 left-3 flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-black/45 text-white">
                <ToolIcon className="size-3.5" />
              </span>
              <span className="truncate text-base font-semibold text-white">{name}</span>
            </span>
            <span className="truncate text-[13px] text-white/75">{description}</span>
          </span>
        </button>
      </HomeTilt>
    </TiltCard>
  )
}
