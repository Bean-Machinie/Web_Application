import type { ReactNode } from "react"

type Props = { className?: string; children: ReactNode }

// A card that lifts toward the viewer on hover; the edge highlight and deeper
// shadow come from tiltCardSkin. It moves in whole pixels and never scales, so
// text and images stay sharp. Style the card itself (fill, border) with
// className. A menu opened from inside the card owns the pointer, so the card
// settles back until it closes.
export function TiltCard({ className, children }: Props) {
  return (
    <div
      className={`${className ?? ""} transition-transform duration-200 ease-out hover:z-10 hover:-translate-y-1 active:translate-y-0 has-[[data-state=open]]:translate-y-0! motion-reduce:transition-none motion-reduce:hover:translate-y-0 pointer-coarse:hover:translate-y-0`}
    >
      {children}
    </div>
  )
}
