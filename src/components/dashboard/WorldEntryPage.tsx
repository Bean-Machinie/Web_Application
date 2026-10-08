import { WorldEntryDetails } from "./WorldEntryDetails"
import { WorldEntryHeader } from "./WorldEntryHeader"
import { WorldFields } from "./WorldFields"
import type { EntryProps } from "./world-entry-props"

// The ordinary page of an entry: header, then its fields. Who can
// see it, and deleting it, are in the details panel the header opens.
export function WorldEntryPage(props: EntryProps) {
  const { entryId, campaignId, kind, name, revealed, canManage, state } = props

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      <WorldEntryHeader
        entryId={entryId}
        campaignId={campaignId}
        kind={kind}
        name={name}
        revealed={revealed}
        canManage={canManage}
        state={state}
        onRename={props.onRename}
        onOpenDetails={() => props.onDetailsOpenChange(true)}
      />
      <WorldFields
        entryId={entryId}
        campaignId={campaignId}
        kind={kind}
        canManage={canManage}
        state={state}
      />
      <WorldEntryDetails
        open={props.detailsOpen}
        onOpenChange={props.onDetailsOpenChange}
        name={name}
        revealed={revealed}
        canManage={canManage}
        onRevealedChange={props.onRevealedChange}
        onDelete={props.onDelete}
      />
    </div>
  )
}
