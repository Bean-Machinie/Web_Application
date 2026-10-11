import { thumbPath } from "@/lib/stamps/stamp-outline"
import type { Stamp } from "@/lib/stamps/stamps"

// A stamp's outline drawn small, in the colour of the text.
export function MapStampThumb({ stamp }: { stamp: Stamp }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="size-8 shrink-0">
      <path d={thumbPath(stamp)} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
