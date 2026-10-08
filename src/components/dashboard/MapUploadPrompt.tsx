import { ImageUp, Map as MapIcon } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import type { MapImageUpload } from "@/hooks/use-map-image-upload"
import { MapImageInput } from "./MapImageInput"

type Props = {
  canManage: boolean
  upload: MapImageUpload
}

// Shown until the map has an image: a GM can upload one, a player waits.
export function MapUploadPrompt({ canManage, upload }: Props) {
  if (!canManage) {
    return (
      <div className="text-muted-foreground bg-muted/40 flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
        <MapIcon className="size-8" />
        This map has no image yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <MapImageInput
        busy={upload.busy}
        onPick={upload.pick}
        className="text-muted-foreground hover:bg-muted/60 bg-muted/40 flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center transition-colors"
      >
        <ImageUp className="size-8" />
        <span className="text-foreground text-sm font-medium">
          {upload.busy ? "Preparing your map…" : "Upload a map"}
        </span>
        <span className="text-xs">
          Click or drop an image. Large maps are shrunk and converted to WebP automatically.
        </span>
      </MapImageInput>
      {upload.error && <FormAlert tone="error">{upload.error}</FormAlert>}
    </div>
  )
}
