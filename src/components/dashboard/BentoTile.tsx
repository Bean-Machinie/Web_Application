import { useState } from "react"
import type { CSSProperties, FocusEvent, ReactNode } from "react"
import { tiltCardSkin } from "@/components/tilt-card-styles"
import { TiltCard } from "@/components/TiltCard"
import { cn } from "@/lib/utils"
import { FlickeringGrid } from "./FlickeringGrid"
import { TileHotContext } from "./tile-hot"

// Literal class names, so Tailwind finds them; the areas are laid out in HomeBento.
const AREAS = {
  lead: "md:[grid-area:lead]",
  map: "md:[grid-area:map]",
  compendium: "md:[grid-area:compendium]",
  characters: "md:[grid-area:characters]",
  play: "md:[grid-area:play]",
  world: "md:[grid-area:world]",
}

export type BentoArea = keyof typeof AREAS

type Props = {
  area: BentoArea
  // Two squares wide: the text in the left square, the art filling the right one.
  wide?: boolean
  // A wide tile's art across the whole tile instead, fading out under the text in the left square.
  artAcross?: boolean
  // Its picture, drawn over the faint flickering grid; given as a function it is told whether the tile is hot.
  art?: ReactNode | ((hot: boolean) => ReactNode)
  // Over the art's square but outside the tile's clipping, for what flies past its edges.
  float?: (hot: boolean) => ReactNode
  // A square tile's gradient behind its text made deeper, for art with light areas.
  strongShade?: boolean
  // A wide tile with the square tiles' dark gradient from its bottom behind its text, which then reads light.
  bottomShade?: boolean
  // Told each time the tile turns hot or stops being hot.
  onHot?: (hot: boolean) => void
  // Kept over its neighbours even when not pointed at, for what lies outside it.
  raised?: boolean
  // How long it stays raised once let go (or no longer raised), in seconds, for what is still outside it.
  raisedFor?: number
  children: ReactNode
}

// Only the short stretch next to the text fades, so the picture itself is seen whole.
const FROM_LEFT = "linear-gradient(to right, transparent, black 12%)"
const fade: CSSProperties = { maskImage: FROM_LEFT, WebkitMaskImage: FROM_LEFT }

// A tile of the Home bento. A square tile's art fills it, with the text at the bottom over a dark
// gradient; a wide one has its text in the left square and its art in the right. Pointed at, or holding
// the keyboard focus, it lifts as every card of the app does (TiltCard: whole pixels, never scaled, so
// its text stays sharp), and what is inside can play its own hover through useTileHot.
export function BentoTile({ area, wide = false, artAcross = false, art, float, strongShade = false, bottomShade = false, onHot, raised = false, raisedFor = 0.6, children }: Props) {
  const [hot, setHot] = useState(false)
  const turn = (next: boolean) => {
    if (next === hot) return
    setHot(next)
    onHot?.(next)
  }
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) turn(false)
  }
  const up = hot || raised
  const square = wide && !artAcross ? "absolute inset-y-0 right-0 aspect-square max-w-[50%]" : "absolute inset-0"

  return (
    <TileHotContext.Provider value={hot}>
      <div
        // Raised over its neighbours while hot, and a little after, so what flies out of it is not hidden; a
        // tile whose cards lie over a neighbour stays over that neighbour even when it is pointed at.
        style={{ zIndex: up ? (float ? 30 : 20) : 0, transition: `z-index 0s linear ${up ? 0 : raisedFor}s` }}
        onPointerEnter={() => turn(true)}
        onPointerLeave={() => turn(false)}
        onFocus={() => turn(true)}
        onBlur={onBlur}
        className={cn("relative min-h-[180px]", AREAS[area], !wide && "aspect-square")}
      >
        <TiltCard className={cn("h-full rounded-xl", tiltCardSkin())}>
          {/* The border's room is kept clear, so the art never runs under it. */}
          <div className="bg-background absolute inset-0 overflow-hidden rounded-xl border border-transparent">
            {/* A solid base under the card colour, which is see-through in places. */}
            <div aria-hidden className="bg-card absolute inset-0" />
            <div aria-hidden className={cn("pointer-events-none", square)} style={wide && !artAcross ? fade : undefined}>
              <FlickeringGrid className="absolute inset-0 size-full" />
              {typeof art === "function" ? art(hot) : art}
            </div>
            {artAcross && <div aria-hidden className="from-card pointer-events-none absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r to-transparent" />}
            {(!wide || bottomShade) && (
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent",
                  strongShade ? "h-3/4 from-black/90 via-black/65" : "h-2/3 from-black/80 via-black/40"
                )}
              />
            )}
          </div>
          {/* One border for every tile, with a thin dark line inside it, so a light picture at the edge (as a
              map's) never makes it look brighter than the others. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-xl border shadow-[inset_0_0_0_1px_rgb(0_0_0/0.35)]" />
          {/* Over the tile's hover highlight, which lies above its content. */}
          {float && <div className={cn("pointer-events-none z-20", square)}>{float(hot)}</div>}
          {/* Over the dark gradient a square tile's text always reads light. */}
          <div className={cn("relative z-10 h-full", wide && "max-w-[50%]", (!wide || bottomShade) && "dark text-foreground")}>{children}</div>
        </TiltCard>
      </div>
    </TileHotContext.Provider>
  )
}
