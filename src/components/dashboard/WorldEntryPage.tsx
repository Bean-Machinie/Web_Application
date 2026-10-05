import { toWorldImage } from "@/lib/world-images"
import { COVER_FIELD } from "@/lib/world-kinds"
import { WorldEntryDetails } from "./WorldEntryDetails"
import { WorldEntryHeader } from "./WorldEntryHeader"
import { WorldEntryMaps } from "./WorldEntryMaps"
import { WorldFields } from "./WorldFields"
import type { EntryProps } from "./world-entry-props"

// The ordinary page of an entry: header, then its fields, then the maps it stands on. Who can
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
      <WorldEntryMaps
        key={entryId}
        entryId={entryId}
        entry={{
          kind,
          name,
          revealed,
          imageUrl: toWorldImage(state.fields?.[COVER_FIELD]?.value)?.url ?? null,
        }}
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
