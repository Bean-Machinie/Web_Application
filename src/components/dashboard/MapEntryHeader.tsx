import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useMapImageUpload } from "@/hooks/use-map-image-upload"
import { toWorldImage } from "@/lib/world-images"
import { COVER_FIELD, WORLD_KINDS } from "@/lib/world-kinds"
import { EditableName } from "./EditableName"
import { HiddenBadge } from "./HiddenBadge"
import { MapUploadPrompt } from "./MapUploadPrompt"
import { MapViewer } from "./MapViewer"
import { SaveIndicator } from "./SaveIndicator"
import type { WorldFieldsState } from "./WorldFields"

type Props = {
  entryId: string
  campaignId: string
  name: string
  canManage: boolean
  state: WorldFieldsState
  onRename: (name: string) => Promise<void>
  revealed: boolean
}

// The header of a map entry: its name and kind, then the map itself instead
// of a picture and facts.
export function MapEntryHeader({
  entryId,
  campaignId,
  name,
  canManage,
  state,
  onRename,
  revealed,
}: Props) {
  const stored = state.fields?.[COVER_FIELD]?.value
  const image = toWorldImage(stored)
  const upload = useMapImageUpload({
    campaignId,
    entryId,
    current: image,
    onSave: (value) => state.saveNow(COVER_FIELD, "image", value),
  })

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex min-w-0 items-start gap-3">
        <EditableName name={name} onSave={canManage ? onRename : null} />
        <div className="flex shrink-0 items-center gap-3 pt-1.5">
          {canManage && <SaveIndicator state={state.saveState} />}
          {!revealed && <HiddenBadge />}
          <Badge variant="outline">{WORLD_KINDS.map.label}</Badge>
        </div>
      </div>
      {!state.fields ? (
        <Skeleton className="aspect-video w-full rounded-lg" />
      ) : image?.width && image.height ? (
        <MapViewer
          // A new image starts a new map, with its own bounds.
          key={image.url}
          campaignId={campaignId}
          mapId={entryId}
          image={{ url: image.url, width: image.width, height: image.height }}
          canManage={canManage}
          upload={upload}
        />
      ) : (
        <MapUploadPrompt canManage={canManage} upload={upload} />
      )}
    </div>
  )
}
