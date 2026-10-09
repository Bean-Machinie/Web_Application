import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { HiddenBadge } from "./HiddenBadge"
import { MemberMenu } from "./MemberMenu"
import { RevealButton } from "./RevealButton"
import { StatusMarker } from "./StatusMarker"
import type { WorldManage } from "./world-manage"

type Props = { entry: WorldEntry; manage: WorldManage | null }

export function WorldEntryCard({ entry, manage }: Props) {
  const { label, icon: KindIcon } = WORLD_KINDS[entry.kind]

  const actions = manage && [
    { label: "Rename", onSelect: () => manage.onRename(entry) },
    {
      label: "Delete",
      destructive: true,
      onSelect: () => manage.onDelete(entry),
    },
  ]

  // On hover the whole card lifts and tilts a touch, with a small overshoot.
  return (
    <div
      className={`group bg-card hover:border-foreground/25 relative overflow-hidden rounded-lg border transition-[translate,rotate,scale,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:z-10 hover:shadow-lg [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:-rotate-1 [@media(hover:hover)]:hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0 motion-reduce:hover:scale-100 ${
        entry.revealed ? "" : "border-dashed"
      }`}>
      <div className="bg-muted text-muted-foreground relative flex aspect-square items-center justify-center overflow-hidden">
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt=""
            loading="lazy"
            className={`size-full object-cover ${entry.revealed ? "" : "opacity-60 grayscale"}`}
          />
        ) : (
          <KindIcon className="size-10" />
        )}
        {!entry.revealed && <HiddenBadge className="absolute top-2 left-2" />}
        <StatusMarker entry={entry} />
      </div>
      <div className="flex flex-col gap-2 p-3.5">
        {/* The stretched link makes the whole card clickable. */}
        <Link
          to={`/app/world/${entry.id}`}
          className="truncate font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-ring focus-visible:after:rounded-lg focus-visible:after:ring-2"
        >
          {entry.name}
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{label}</Badge>
        </div>
      </div>
      {actions && (
        // Focus only keeps it open for the keyboard; a mouse click leaves
        // focus on the button, which would pin it open after the cursor leaves.
        <div className="bg-background/85 absolute top-2 right-2 z-10 flex rounded-md backdrop-blur-sm transition-opacity has-[:focus-visible]:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
          <RevealButton
            revealed={entry.revealed}
            name={entry.name}
            onChange={(revealed) => manage.onReveal(entry, revealed)}
          />
          <MemberMenu name={entry.name} actions={actions} />
        </div>
      )}
    </div>
  )
}
