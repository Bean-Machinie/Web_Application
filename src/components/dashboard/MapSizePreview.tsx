import { css } from "@/lib/colour"
import { ratioText } from "@/lib/map-canvas-size"
import { themeFor } from "@/lib/map-theme"

// The sea as the map starts: the light of its water.
const SEA = css(themeFor("ocean").water.light)

// Past these proportions the rectangle would be a line; the numbers still say the truth.
const SHOWN_RATIO = { min: 0.15, max: 6.5 }

// A plain rectangle in the sea's colour, at the proportions of the canvas, fitted into a
// square frame and moving smoothly as the size changes, with the size and ratio under it.
export function MapSizePreview({ width, height }: { width: number; height: number }) {
  const known = width > 0 && height > 0
  const ratio = known ? Math.min(SHOWN_RATIO.max, Math.max(SHOWN_RATIO.min, width / height)) : 1

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-muted flex aspect-square w-full max-w-64 items-center justify-center rounded-lg border p-6">
        <div className="relative size-full">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border transition-[width,height,opacity] duration-150 ease-out"
            style={{
              backgroundColor: SEA,
              width: `${ratio >= 1 ? 100 : 100 * ratio}%`,
              height: `${ratio >= 1 ? 100 / ratio : 100}%`,
              opacity: known ? 1 : 0.4,
            }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium tabular-nums">
          {known ? `${width} × ${height} px` : "—"}
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">{ratioText(width, height) || "—"}</span>
      </div>
    </div>
  )
}
