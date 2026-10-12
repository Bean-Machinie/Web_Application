import { useState } from "react"
import { Camera } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useFileDataUrl } from "@/hooks/use-file-data-url"
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"
import { AVATAR_MAX_BYTES, AVATAR_TYPES, NO_AVATAR_CHANGE } from "@/lib/avatar"
import type { AvatarChange } from "@/lib/avatar"
import { cn } from "@/lib/utils"
import { AvatarCropDialog } from "./AvatarCropDialog"

type Props = {
  change: AvatarChange
  onChange: (change: AvatarChange) => void
  disabled: boolean
  currentUrl: string
  fallback: string
}

// The avatar beside a drop zone. A file picked or dropped goes through the crop dialog first.
export function PhotoField({ change, onChange, disabled, currentUrl, fallback }: Props) {
  const [cropSource, setCropSource] = useState<File | null>(null)
  const [
    { isDragging, errors },
    { openFileDialog, getInputProps, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, clearFiles },
  ] = useFileUpload({
    accept: AVATAR_TYPES,
    maxSize: AVATAR_MAX_BYTES,
    onFilesAdded: ([added]) => {
      setCropSource(added.file as File)
      clearFiles()
    },
  })
  const pendingUrl = useFileDataUrl(change.file)
  const shownUrl = pendingUrl ?? (change.remove ? "" : currentUrl)

  return (
    <div className="grid justify-items-start gap-3">
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          aria-label={shownUrl ? "Change photo" : "Upload photo"}
          disabled={disabled}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "group/photo ring-offset-background focus-visible:ring-ring relative size-24 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-default",
            isDragging && "ring-primary ring-2 ring-offset-2"
          )}
        >
          <Avatar className="size-full">
            {shownUrl && <AvatarImage src={shownUrl} alt="" />}
            <AvatarFallback className="text-2xl">{fallback}</AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity duration-200",
              "group-hover/photo:opacity-100 group-focus-visible/photo:opacity-100",
              isDragging && "opacity-100"
            )}
          >
            <Camera className="size-5" />
          </span>
        </button>
        {shownUrl && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(currentUrl ? { file: null, remove: true } : NO_AVATAR_CHANGE)}
            className="text-muted-foreground/70 hover:text-foreground text-[11px] transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>
      <input {...getInputProps()} className="sr-only" tabIndex={-1} />
      {errors[0] && (
        <div className="w-72 max-w-full">
          <FormAlert tone="error">
            {`${errors[0]} Use a PNG, JPG, WebP or GIF up to ${formatBytes(AVATAR_MAX_BYTES, 0)}.`}
          </FormAlert>
        </div>
      )}
      <AvatarCropDialog
        file={cropSource}
        onCancel={() => setCropSource(null)}
        onApply={(file) => {
          onChange({ file, remove: false })
          setCropSource(null)
        }}
      />
    </div>
  )
}
