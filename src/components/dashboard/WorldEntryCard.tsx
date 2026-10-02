import { Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { MemberMenu } from "./MemberMenu"
import type { WorldManage } from "./world-manage"

type Props = { entry: WorldEntry; manage: WorldManage | null }

export function WorldEntryCard({ entry, manage }: Props) {
  const { label, icon: KindIcon } = WORLD_KINDS[entry.kind]

  const actions = manage && [
    { label: "Rename", onSelect: () => manage.onRename(entry) },
    {
      label: entry.revealed ? "Hide" : "Reveal",
      icon: entry.revealed ? EyeOff : Eye,
      onSelect: () => manage.onReveal(entry, !entry.revealed),
    },
    {
      label: "Delete",
      destructive: true,
      onSelect: () => manage.onDelete(entry),
    },
  ]

  return (
    <div className="group bg-card hover:border-foreground/25 relative overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md">
      <div className="bg-muted text-muted-foreground flex aspect-[4/3] items-center justify-center overflow-hidden">
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <KindIcon className="size-10" />
        )}
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
          {!entry.revealed && (
            <EyeOff
              className="text-muted-foreground size-3.5"
              aria-label="Hidden from players"
            />
          )}
        </div>
      </div>
      {actions && (
        <div className="bg-background/85 absolute top-2 right-2 z-10 rounded-md backdrop-blur-sm transition-opacity has-[[data-state=open]]:opacity-100 focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
          <MemberMenu name={entry.name} actions={actions} />
        </div>
      )}
    </div>
  )
}
