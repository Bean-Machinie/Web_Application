import { Link } from "react-router-dom"
import { TiltCard } from "@/components/TiltCard"
import { tiltCardSkin } from "@/components/tilt-card-styles"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { isCopyable } from "@/lib/world-copy"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { HiddenBadge } from "./HiddenBadge"
import { KindLabel } from "./KindLabel"
import { MemberMenu } from "./MemberMenu"
import { RevealButton } from "./RevealButton"
import { StatusMarker } from "./StatusMarker"
import { useWorldScope } from "./useWorldScope"
import type { WorldManage } from "./world-manage"

type Props = { entry: WorldEntry; manage: WorldManage | null; selection: EntrySelection | null }

export function WorldEntryCard({ entry, manage, selection }: Props) {
  const selected = selection?.isSelected(entry.id) ?? false
  const { basePath, hasVisibility } = useWorldScope()
  // A library has no visibility, so nothing in it is drawn as hidden.
  const hidden = hasVisibility && !entry.revealed
  const { icon: KindIcon } = WORLD_KINDS[entry.kind]

  const save = manage?.onSaveToLibrary
  const actions = manage && [
    { label: "Rename", onSelect: () => manage.onRename(entry) },
    ...(save && isCopyable(entry.kind)
      ? [{ label: "Save to library", onSelect: () => save(entry) }]
      : []),
    {
      label: "Delete",
      destructive: true,
      onSelect: () => manage.onDelete(entry),
    },
  ]

  return (
    <TiltCard
      className={`group ${selected ? "bg-primary/10" : "bg-card"} rounded-lg border ${tiltCardSkin(selected ? "selected" : "default")} ${
        hidden ? "border-dashed" : ""
      } ${selected ? "border-primary ring-primary ring-2" : ""}`}>
      <div className="overflow-hidden rounded-[inherit]">
      <div className="bg-muted text-muted-foreground relative flex aspect-square items-center justify-center overflow-hidden">
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt=""
            loading="lazy"
            className={`size-full object-cover ${hidden ? "opacity-60 grayscale" : ""}`}
          />
        ) : (
          <KindIcon className="size-10" />
        )}
        {hidden && <HiddenBadge className="absolute right-2 bottom-2" />}
        <StatusMarker entry={entry} />
      </div>
      <div className="flex flex-col gap-0.5 p-2.5">
        {/* The stretched link makes the whole card clickable. */}
        <Link
          to={`${basePath}/${entry.id}`}
          onClick={(event) => {
            // Once anything is picked a click picks; Shift or Ctrl/Cmd picks too.
            if (!selection) return
            if (selection.active || event.shiftKey || event.ctrlKey || event.metaKey) {
              event.preventDefault()
              selection.click(entry.id, event)
            }
          }}
          className="truncate font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-ring focus-visible:after:rounded-lg focus-visible:after:ring-2"
        >
          {entry.name}
        </Link>
        <KindLabel kind={entry.kind} />
      </div>
      </div>
      {actions && (
        // Focus only keeps it open for the keyboard; a mouse click leaves
        // focus on the button, which would pin it open after the cursor leaves.
        <div className="bg-background/85 absolute top-2 right-2 z-10 flex rounded-md backdrop-blur-sm transition-opacity has-[:focus-visible]:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
          {hasVisibility && (
            <RevealButton
              revealed={entry.revealed}
              name={entry.name}
              onChange={(revealed) => manage.onReveal(entry, revealed)}
            />
          )}
          <MemberMenu name={entry.name} actions={actions} />
        </div>
      )}
    </TiltCard>
  )
}
