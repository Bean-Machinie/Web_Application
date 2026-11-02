import type { Sides } from "@/lib/dice"

// Line silhouettes of the real dice, drawn at the same weight as Lucide icons.
const SHAPES: Record<Sides, string> = {
  4: "M12 3 21.5 19.5H2.5Z M12 3v16.5",
  6: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z",
  8: "M12 2.5 21 12l-9 9.5L3 12Z M3 12h18",
  10: "M12 2.5 20 9.5 12 21.5 4 9.5Z M4 9.5l8 3 8-3 M12 12.5v9",
  12: "M12 2.5 21.5 9.5 18 20.5H6L2.5 9.5Z M12 8l4 3-1.5 4.5h-5L8 11Z",
  20: "M12 2 21 7v10l-9 5-9-5V7Z M12 7l5 9H7Z",
  100: "M8 4l5.5 5.5L8 20 2.5 9.5Z M16 4l5.5 5.5L16 20l-5.5-10.5Z",
}

export function DieIcon({ sides, className }: { sides: Sides; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d={SHAPES[sides]} />
    </svg>
  )
}
