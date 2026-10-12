import { Button } from "@/components/ui/button"
import { formatBytes } from "@/hooks/use-file-upload"
import { AVATAR_MAX_BYTES } from "@/lib/avatar"

type Props = {
  hasImage: boolean
  disabled: boolean
  onUpload: () => void
  onRemove: () => void
}

export function AvatarButtons({ hasImage, disabled, onUpload, onRemove }: Props) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={onUpload}>
          Upload new
        </Button>
        {hasImage && (
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
      <p className="text-muted-foreground text-xs">
        PNG, JPG, WebP or GIF, up to {formatBytes(AVATAR_MAX_BYTES, 0)}.
      </p>
    </div>
  )
}
