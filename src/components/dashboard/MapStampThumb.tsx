import { thumbPath } from "@/lib/stamps/stamp-outline"
import type { Stamp } from "@/lib/stamps/stamps"

type Props = {
  stamp: Stamp
  active: boolean
  onPick: () => void
  onContextMenu?: (event: React.MouseEvent) => void
}

// One stamp of the library: its outline drawn small, with its name under it.
export function MapStampThumb({ stamp, active, onPick, onContextMenu }: Props) {
  return (
    <button
      type="button"
      title={stamp.name}
      aria-label={stamp.name}
      aria-pressed={active}
      onClick={onPick}
      onContextMenu={onContextMenu}
      className={`flex min-w-0 flex-col items-center gap-1 rounded-md px-1 pt-1.5 pb-1 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring ${
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <svg viewBox="0 0 100 100" aria-hidden className="size-9">
        <path d={thumbPath(stamp)} fill="currentColor" fillRule="evenodd" />
      </svg>
      <span className="w-full truncate text-center text-[10px] leading-none">{stamp.name}</span>
    </button>
  )
}
