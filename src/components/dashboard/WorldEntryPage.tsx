import { toWorldImage } from "@/lib/world-images"
import { COVER_FIELD } from "@/lib/world-kinds"
import { useEntryPlacements } from "@/hooks/use-entry-placements"
import { WorldEntryDetails } from "./WorldEntryDetails"
import { WorldEntryHeader } from "./WorldEntryHeader"
import { WorldEntryMaps } from "./WorldEntryMaps"
import { WorldFields } from "./WorldFields"
import type { EntryProps } from "./world-entry-props"

// The ordinary page of an entry: header, then its fields with the maps it
// stands on beside them. Who can see it, and deleting it, are in the details
// panel the header opens.
export function WorldEntryPage(props: EntryProps) {
  const { entryId, campaignId, kind, name, revealed, canManage, state } = props
  // Null while loading, and the maps appear when they arrive.
  const placements = useEntryPlacements(entryId)

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
      {/* The fields, with the maps the entry stands on beside them from lg up
          and below them on narrower screens. */}
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1 lg:pr-6">
          <WorldFields
            entryId={entryId}
            campaignId={campaignId}
            kind={kind}
            canManage={canManage}
            state={state}
          />
        </div>
        {placements && placements.length > 0 && (
          <WorldEntryMaps
            placements={placements}
            entry={{
              kind,
              name,
              revealed,
              imageUrl: toWorldImage(state.fields?.[COVER_FIELD]?.value)?.url ?? null,
            }}
          />
        )}
      </div>
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
