import { useEntryConnections } from "@/hooks/use-entry-connections"
import { cn } from "@/lib/utils"
import { ConnectionsRail } from "./ConnectionsRail"
import { WorldEntryDetails } from "./WorldEntryDetails"
import { WorldEntryHeader } from "./WorldEntryHeader"
import { WorldEntryTitleBar } from "./WorldEntryTitleBar"
import { WorldFields } from "./WorldFields"
import type { EntryProps } from "./world-entry-props"

// The ordinary page of an entry, on one grid that scrolls with the page. The name
// with its status, kind and menu runs across the top. Under it: the image, the
// facts, and, when the content area is wide enough, the connections card at the
// right, level with both and as tall. Then the text fields across the whole page.
// Where the content area is narrower the card goes after the fields. The grid sets
// the image size: the full width on a phone, 16rem from sm, 20rem from lg. Who can
// see the entry, and deleting it, are in the details panel the menu opens.
//
// With no connections there is no card, and the facts card takes its place at the
// right edge. The widths are those of the content area, which the sidebar narrows,
// so the card waits for 64rem of it, not for a window width.
export function WorldEntryPage(props: EntryProps) {
  const { entryId, folder, kind, name, revealed, canManage, state } = props
  // Asked again after each save, so the card appears with the first mention.
  const { connections } = useEntryConnections(entryId, kind, state.saveState)
  const showConnections = connections !== null && connections.total > 0

  return (
    <div className="@container">
      <div
        className={cn(
          "mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 [--image-size:calc(100vw-2rem)] sm:grid-cols-[var(--image-size)_minmax(0,1fr)] sm:[--image-size:16rem] lg:[--image-size:20rem]",
          showConnections && "@5xl:grid-cols-[var(--image-size)_minmax(0,1fr)_18.5rem]"
        )}
      >
        <div className="col-span-full">
          <WorldEntryTitleBar
            kind={kind}
            name={name}
            canManage={canManage}
            revealed={revealed}
            saveState={state.saveState}
            onRename={props.onRename}
            onOpenDetails={() => props.onDetailsOpenChange(true)}
            fresh={props.fresh}
          />
        </div>
        <WorldEntryHeader
          entryId={entryId}
          folder={folder}
          kind={kind}
          canManage={canManage}
          revealed={revealed}
          state={state}
        />
        <div className="col-span-full mt-2 min-w-0">
          <WorldFields
            entryId={entryId}
            folder={folder}
            kind={kind}
            canManage={canManage}
            state={state}
          />
        </div>
        {showConnections && (
          <ConnectionsRail entryId={entryId} name={name} connections={connections} />
        )}
        <WorldEntryDetails
          open={props.detailsOpen}
          onOpenChange={props.onDetailsOpenChange}
          name={name}
          revealed={revealed}
          canManage={canManage}
          onRevealedChange={props.onRevealedChange}
          onDelete={props.onDelete}
          onSaveToLibrary={props.onSaveToLibrary}
        />
      </div>
    </div>
  )
}
