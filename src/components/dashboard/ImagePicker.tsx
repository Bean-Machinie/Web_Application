import { useState } from "react"
import type { ReactNode } from "react"
import { Upload, X } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { useFileUpload } from "@/hooks/use-file-upload"
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from "@/lib/avatar"
import { cn } from "@/lib/utils"
import { AvatarCropDialog } from "./AvatarCropDialog"

type Props = {
  url: string | null
  fallback: ReactNode
  disabled: boolean
  onPick: (file: File) => void
  onRemove: () => void
}

// A square tile: click or drop to upload or replace, with the same crop
// dialog as the campaign image.
export function ImagePicker({ url, fallback, disabled, onPick, onRemove }: Props) {
  const [cropSource, setCropSource] = useState<File | null>(null)

  const [
    { isDragging, errors },
    {
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      clearFiles,
    },
  ] = useFileUpload({
    accept: AVATAR_TYPES,
    maxSize: AVATAR_MAX_BYTES,
    onFilesAdded: ([added]) => {
      setCropSource(added.file as File)
      clearFiles()
    },
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="group/image relative size-[var(--image-size,7rem)] shrink-0">
        <button
          type="button"
          aria-label={url ? "Change image" : "Upload image"}
          disabled={disabled}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "bg-muted text-muted-foreground focus-visible:ring-ring relative flex size-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border outline-none focus-visible:ring-2 disabled:cursor-default",
            isDragging && "ring-primary ring-2"
          )}
        >
          {url ? <img src={url} alt="" className="size-full object-cover" /> : fallback}
          <span
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-white opacity-0 transition-opacity duration-200",
              "group-hover/image:opacity-100 group-focus-within/image:opacity-100",
              isDragging && "opacity-100"
            )}
          >
            <Upload className="size-5" />
            <span className="text-[11px] leading-none font-medium">
              {url ? "Change" : "Upload"}
            </span>
          </span>
        </button>
        {url && (
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            aria-label="Remove image"
            disabled={disabled}
            onClick={onRemove}
            className="absolute -top-2 -right-2 rounded-full border opacity-0 shadow-xs transition-opacity group-focus-within/image:opacity-100 group-hover/image:opacity-100"
          >
            <X />
          </Button>
        )}
        <input {...getInputProps()} className="sr-only" tabIndex={-1} />
      </div>
      {errors[0] && <FormAlert tone="error">{errors[0]}</FormAlert>}
      <AvatarCropDialog
        file={cropSource}
        cropShape="rect"
        onCancel={() => setCropSource(null)}
        onApply={(file) => {
          onPick(file)
          setCropSource(null)
        }}
      />
    </div>
  )
}
