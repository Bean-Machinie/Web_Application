import { toWorldImage } from "@/lib/world-images"
import type { FieldViewProps } from "./field-types"

export function ImageFieldView({ value, fallback }: FieldViewProps) {
  const image = toWorldImage(value)

  return (
    <div className="bg-muted text-muted-foreground flex size-[var(--image-size,7rem)] shrink-0 items-center justify-center overflow-hidden rounded-xl border">
      {image ? <img src={image.url} alt="" className="size-full object-cover" /> : fallback}
    </div>
  )
}
