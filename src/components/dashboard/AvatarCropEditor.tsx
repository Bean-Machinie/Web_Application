import { useState } from "react"
import Cropper from "react-easy-crop"
import type { Area, Point } from "react-easy-crop"
import { Image as ImageIcon, Loader2, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { FormAlert } from "@/components/auth/FormAlert"
import { useFileDataUrl } from "@/hooks/use-file-data-url"
import { getCroppedFile } from "@/lib/crop-image"

type Props = {
  file: File
  onCancel: () => void
  onApply: (file: File) => void
}

export function AvatarCropEditor({ file, onCancel, onApply }: Props) {
  const src = useFileDataUrl(file)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [area, setArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  function reset() {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }

  async function apply() {
    if (!area || !src) return
    setBusy(true)
    try {
      onApply(await getCroppedFile(src, area, rotation))
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Could not crop.")
      setBusy(false)
    }
  }

  return (
    <>
      <div className="bg-muted relative h-72 overflow-hidden rounded-lg">
        {src && (
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setArea(pixels)}
        />
        )}
      </div>

      <div className="flex items-center gap-3">
        <ImageIcon className="text-muted-foreground size-3.5 shrink-0" />
        <Slider
          aria-label="Zoom"
          min={1}
          max={3}
          step={0.01}
          value={[zoom]}
          onValueChange={([value]) => setZoom(value)}
        />
        <ImageIcon className="text-muted-foreground size-5 shrink-0" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Rotate"
          onClick={() => setRotation((rotation + 90) % 360)}
        >
          <RotateCw className="size-4" />
        </Button>
      </div>

      {failure && <FormAlert tone="error">{failure}</FormAlert>}

      <DialogFooter className="sm:justify-between">
        <Button type="button" variant="ghost" onClick={reset} disabled={busy}>
          Reset
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={apply} disabled={busy || !area}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Apply
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}
