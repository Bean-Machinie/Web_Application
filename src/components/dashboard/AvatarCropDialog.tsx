import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AvatarCropEditor } from "./AvatarCropEditor"

type Props = {
  file: File | null
  onCancel: () => void
  onApply: (file: File) => void
  cropShape?: "round" | "rect"
}

export function AvatarCropDialog({ file, onCancel, onApply, cropShape }: Props) {
  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit image</DialogTitle>
          <DialogDescription>
            Drag to reposition and use the slider to zoom.
          </DialogDescription>
        </DialogHeader>
        {file && (
          <AvatarCropEditor
            file={file}
            onCancel={onCancel}
            onApply={onApply}
            cropShape={cropShape}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
