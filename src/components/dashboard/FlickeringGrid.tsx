import { useRef } from "react"
import { useCanvasLoop } from "@/hooks/use-canvas-loop"
import type { CanvasFrame } from "@/hooks/use-canvas-loop"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useThemeColors } from "@/hooks/use-theme-colors"

const CELL = 6
const SQUARE = 2
const MAX_ALPHA = 0.06
// The share of squares that pick a new brightness each frame, so the flicker stays slow.
const CHANGE = 0.03

// A field of tiny squares that dim and brighten at random, very faintly, behind a tile's picture,
// in the grain of the dithered background.
export function FlickeringGrid({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const { foreground } = useThemeColors()
  const cells = useRef<{ cols: number; rows: number; alpha: Float32Array } | null>(null)

  useCanvasLoop(
    canvas,
    ({ ctx, width, height }: CanvasFrame) => {
      const cols = Math.ceil(width / CELL)
      const rows = Math.ceil(height / CELL)
      let grid = cells.current
      if (!grid || grid.cols !== cols || grid.rows !== rows) {
        grid = { cols, rows, alpha: Float32Array.from({ length: cols * rows }, () => Math.random() * MAX_ALPHA) }
        cells.current = grid
      } else {
        for (let i = 0; i < grid.alpha.length; i++) if (Math.random() < CHANGE) grid.alpha[i] = Math.random() * MAX_ALPHA
      }
      ctx.fillStyle = foreground
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          ctx.globalAlpha = grid.alpha[y * cols + x]
          ctx.fillRect(x * CELL, y * CELL, SQUARE, SQUARE)
        }
      }
      ctx.globalAlpha = 1
    },
    reduced ? 0 : 10
  )

  return <canvas ref={canvas} aria-hidden className={className} />
}
