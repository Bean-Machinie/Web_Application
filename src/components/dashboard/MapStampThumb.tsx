import { thumbPath } from "@/lib/stamps/stamp-outline"
import type { Stamp } from "@/lib/stamps/stamps"

// A stamp's outline drawn small, as lucide draws an icon: a line in the colour of the text,
// with a soft fill inside it.
export function MapStampThumb({ stamp }: { stamp: Stamp }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="size-5 shrink-0">
      <path
        d={thumbPath(stamp)}
        className="fill-current/15"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinejoin="round"
        fillRule="evenodd"
      />
    </svg>
  )
}
