import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import type { ConnectionRow as Row } from "@/lib/connection-groups"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { HiddenBadge } from "./HiddenBadge"
import { useWorldScope } from "./useWorldScope"

type Props = {
  row: Row
  to: string
  state?: unknown
  onOpen?: () => void
}

// One connected entry: its picture or kind icon, its name, where it is linked,
// and a click to open it. A library has no players, so nothing in it is hidden.
export function ConnectionRow({ row, to, state, onOpen }: Props) {
  const { hasVisibility } = useWorldScope()
  const { entry, note, pinCount } = row
  const { icon: KindIcon } = WORLD_KINDS[entry.kind]

  return (
    <li>
      <Link
        to={to}
        state={state}
        onClick={onOpen}
        className="hover:bg-muted/50 focus-visible:ring-ring flex items-center gap-3 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-inset"
      >
        <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {entry.imageUrl ? (
            <img src={entry.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <KindIcon className="size-4" />
          )}
        </span>
        <span className="grid min-w-0 flex-1">
          <span className="truncate text-sm">{entry.name}</span>
          {note && <span className="text-muted-foreground truncate text-xs">{note}</span>}
        </span>
        {hasVisibility && !entry.revealed && <HiddenBadge className="shrink-0" />}
        {pinCount > 1 && (
          <Badge variant="secondary" className="shrink-0" title={`${pinCount} pins`}>
            ×{pinCount}
          </Badge>
        )}
      </Link>
    </li>
  )
}
