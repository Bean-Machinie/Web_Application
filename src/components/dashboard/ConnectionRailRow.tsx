import { HoverIcon } from "@/components/icons/HoverIcon"
import { EyeOffIcon } from "@/components/icons/EyeOffIcon"
import { Link } from "react-router-dom"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { ConnectionRow } from "@/lib/connection-groups"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { useWorldScope } from "./useWorldScope"

type Props = {
  row: ConnectionRow
  to: string
  state?: unknown
  onOpen?: () => void
}

// One line like an item of the sidebar: full width, 32px tall, a small picture or
// kind icon and the name, which is cut with an ellipsis. Where the link is (the
// field, how many pins) and whether players cannot see it are in the tooltip. A
// library has no players, so nothing in it is hidden.
export function ConnectionRailRow({ row, to, state, onOpen }: Props) {
  const { hasVisibility } = useWorldScope()
  const { entry, note, pinCount } = row
  const { icon: KindIcon } = WORLD_KINDS[entry.kind]
  const hidden = hasVisibility && !entry.revealed
  const tip = [note, pinCount > 1 && `${pinCount} pins`, hidden && "Hidden from players"]
    .filter(Boolean)
    .join(" · ")

  const link = (
    <Link
      to={to}
      state={state}
      onClick={onOpen}
      className="hover:bg-muted/60 focus-visible:ring-ring flex h-8 w-full min-w-0 items-center gap-2 rounded-md px-2 text-sm outline-none focus-visible:ring-2"
    >
      <span className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <KindIcon className="size-3" />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">{entry.name}</span>
      {hidden && <HoverIcon icon={EyeOffIcon} size={14} className="text-muted-foreground shrink-0" aria-hidden />}
    </Link>
  )

  return (
    <li className="min-w-0">
      {tip ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="left">{tip}</TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  )
}
