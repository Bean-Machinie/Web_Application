import { useMemo, useRef } from "react"
import { useDither } from "@/hooks/use-dither"
import { useScopeId } from "@/hooks/use-scope-id"
import { campaignScene, homeScene } from "@/lib/dither-scene"

// The dithered waves behind the content area, in the dark theme only (in the light one it is not
// shown, which also stops it). It is pinned to the window while the page scrolls: a box with no
// height that sticks to the top, and the screen-sized box the canvas fills hangs from it. It sits
// behind the content, which is positioned to come after it, and takes no pointer events. Still, it draws one frame and stops.
// Inside a campaign it takes that campaign's colour and drift.
export function DitherBackground({ still }: { still: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const campaignId = useScopeId()
  const scene = useMemo(() => (campaignId ? campaignScene(campaignId) : homeScene()), [campaignId])
  useDither(box, still, scene)

  return (
    <div aria-hidden className="pointer-events-none sticky top-0 z-0 hidden h-0 w-full dark:block">
      <div ref={box} className="absolute top-0 left-0 h-svh w-full" />
    </div>
  )
}
