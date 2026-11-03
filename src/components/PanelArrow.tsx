import { Popover } from "radix-ui"

// The speech-bubble tail of a panel, pointing at the button that opened it. It sits outside the panel's
// box, so the panel must not clip its overflow itself: round and clip an inner wrapper instead.
// Radix turns the tail to face the button, so it is drawn pointing down. Its outline is the panel's
// border colour on the two slanted sides, and the fill covers the border at the base.
export function PanelArrow() {
  return (
    <Popover.Arrow asChild>
      <svg width={14} height={13} viewBox="0 0 14 13" className="text-foreground/25 overflow-visible drop-shadow-sm">
        <path d="M0 0 L7 12.5 L14 0 Z" className="fill-popover" />
        <path d="M0.5 0.5 L7 12.5 L13.5 0.5" fill="none" stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
      </svg>
    </Popover.Arrow>
  )
}
