import { Upload } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { useFileUpload } from "@/hooks/use-file-upload"
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from "@/lib/avatar"
import { cn } from "@/lib/utils"

type Props = { onPick: (file: File) => void }

// A drop zone for a picture of the person's own.
export function CoverUpload({ onPick }: Props) {
  const [
    { isDragging, errors },
    { openFileDialog, getInputProps, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, clearFiles },
  ] = useFileUpload({
    accept: AVATAR_TYPES,
    maxSize: AVATAR_MAX_BYTES,
    onFilesAdded: ([added]) => {
      onPick(added.file as File)
      clearFiles()
    },
  })

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "text-muted-foreground hover:bg-muted/50 focus-visible:ring-ring flex h-32 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed text-sm outline-none focus-visible:ring-2",
          isDragging && "border-primary bg-muted/50"
        )}
      >
        <Upload className="size-5" />
        <span>Drop an image or click to browse</span>
        <span className="text-xs">PNG, JPG, WebP or GIF, up to 2 MB</span>
      </button>
      {errors[0] && <FormAlert tone="error">{errors[0]}</FormAlert>}
      <input {...getInputProps()} className="sr-only" tabIndex={-1} />
    </div>
  )
}
