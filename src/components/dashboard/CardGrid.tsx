import { useRef } from "react"
import type { ReactNode } from "react"
import { useColumnGlide } from "@/hooks/use-column-glide"
import { gridStyle } from "./world-grid-style"

// A grid of cards whose size follows the panel; a column coming or going glides.
export function CardGrid({ wide, children }: { wide?: boolean; children: ReactNode }) {
  const grid = useRef<HTMLDivElement>(null)
  useColumnGlide(grid, ":scope > *")
  return (
    <div ref={grid} style={gridStyle(wide)} className="grid gap-4">
      {children}
    </div>
  )
}
