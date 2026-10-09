import { lazy, Suspense } from "react"
import { Upload } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useMapImageUpload } from "@/hooks/use-map-image-upload"
import { useMapUploadGuard } from "@/hooks/use-map-upload-guard"
import { cn } from "@/lib/utils"
import { toWorldImage } from "@/lib/world-images"
import { COVER_FIELD } from "@/lib/world-kinds"
import { ConfirmDialog } from "./ConfirmDialog"
import { MapBuildAction } from "./MapBuildAction"
import { MapBuilderLink } from "./MapBuilderLink"
import { MapImageInput } from "./MapImageInput"
import { MapDetailsButton } from "./MapDetailsButton"
import { MapTitlePill } from "./MapTitlePill"
import { MapUploadPrompt } from "./MapUploadPrompt"
import { SaveIndicator } from "./SaveIndicator"
import { EditableName } from "./EditableName"
import { WorldEntryDetails } from "./WorldEntryDetails"
import { WorldFields } from "./WorldFields"
import type { EntryProps } from "./world-entry-props"

// The map brings Leaflet with it, so it loads only on a page that shows one.
const MapViewer = lazy(() => import("./MapViewer").then((module) => ({ default: module.MapViewer })))

// A map entry fills the whole content area under the app header, with
// nothing around it: the details button, the navigator, the zoom bar and the marker tools float
// over it, and everything else, renaming included, is in the details panel. The negative margin
// takes back the padding the layout puts around pages. It is isolated, so
// what floats over the map stays beneath the details panel and its overlay.
export function MapEntryScreen(props: EntryProps) {
  const { entryId, campaignId, kind, name, revealed, canManage, state } = props
  const image = toWorldImage(state.fields?.[COVER_FIELD]?.value)
  const picker = useMapImageUpload({
    campaignId,
    entryId,
    current: image,
    onSave: (value) => state.saveNow(COVER_FIELD, "image", value),
  })
  const { built, upload, confirm } = useMapUploadGuard(entryId, canManage, picker)
  const hasImage = Boolean(image?.width && image.height)

  return (
    <div className="bg-muted relative isolate -m-4 min-h-96 flex-1 overflow-hidden md:-m-6">
      {!state.fields ? (
        <Skeleton className="size-full rounded-none" />
      ) : image?.width && image.height ? (
        <Suspense fallback={<Skeleton className="size-full rounded-none" />}>
          <MapViewer
            // A new image starts a new map, with its own bounds.
            key={image.url}
            campaignId={campaignId}
            mapId={entryId}
            mapName={name}
            image={{
              url: image.url,
              width: image.width,
              height: image.height,
              maxZoom: image.maxZoom,
            }}
            canManage={canManage}
            onDetails={() => props.onDetailsOpenChange(true)}
          />
        </Suspense>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-xl">
            <MapUploadPrompt canManage={canManage} upload={upload} />
            {canManage && (
              <div className="mt-3 flex justify-center">
                <MapBuildAction mapId={entryId} built={built} />
              </div>
            )}
          </div>
        </div>
      )}
      <MapTitlePill revealed={revealed} />
      {!hasImage && <MapDetailsButton onClick={() => props.onDetailsOpenChange(true)} />}
      <WorldEntryDetails
        open={props.detailsOpen}
        onOpenChange={props.onDetailsOpenChange}
        name={name}
        revealed={revealed}
        canManage={canManage}
        onRevealedChange={props.onRevealedChange}
        onDelete={props.onDelete}
        status={canManage && <SaveIndicator state={state.saveState} />}
      >
        {canManage && (
          <section className="flex flex-col gap-3 border-b px-5 py-4">
            <h3 className="text-sm font-medium">Name</h3>
            <EditableName name={name} onSave={props.onRename} small />
          </section>
        )}
        {/* Its own divider and roomy rows are not wanted in the narrow panel. */}
        <div className="border-b px-5 [&>div]:border-t-0 [&_section]:py-4">
          <WorldFields
            entryId={entryId}
            campaignId={campaignId}
            kind={kind}
            canManage={canManage}
            state={state}
          />
        </div>
        {canManage && built && (
          <section className="flex flex-col gap-3 border-b px-5 py-4">
            <div>
              <h3 className="text-sm font-medium">Map builder</h3>
              <p className="text-muted-foreground mt-0.5 text-[13px] leading-snug">
                This map was built here. Editing it reopens the canvas; publishing renders a new
                image.
              </p>
            </div>
            <MapBuilderLink mapId={entryId} />
          </section>
        )}
        {canManage && image && (
          <section className="flex flex-col gap-3 border-b px-5 py-4">
            <div>
              <h3 className="text-sm font-medium">Map image</h3>
              <p className="text-muted-foreground mt-0.5 text-[13px] leading-snug">
                Replacing it keeps your markers where they are, as a share of the image.
              </p>
            </div>
            <MapImageInput
              busy={upload.busy}
              onPick={upload.pick}
              className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
            >
              <Upload />
              {upload.busy ? "Uploading…" : "Replace map"}
            </MapImageInput>
            {upload.error && <FormAlert tone="error">{upload.error}</FormAlert>}
          </section>
        )}
      </WorldEntryDetails>
      <ConfirmDialog
        {...confirm}
        title="Replace the built map?"
        description="Uploading an image replaces this map's image and discards its builder scene, so it can no longer be edited in the builder. Markers stay where they are, as a share of the image."
        confirmLabel="Upload and discard the scene"
      />
    </div>
  )
}
