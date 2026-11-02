import { defaultCoverById, gradientOf } from "@/lib/campaign-covers"
import type { CoverChoice } from "@/lib/campaign-covers"
import { cn } from "@/lib/utils"

type Props = { cover: CoverChoice; className?: string }

// A cover filling its box: the picture, or the default's gradient.
export function CoverImage({ cover, className }: Props) {
  if (cover.kind === "upload") {
    return <img src={cover.url} alt="" className={cn("size-full object-cover", className)} />
  }
  return (
    <div
      className={cn("size-full", className)}
      style={{ background: gradientOf(defaultCoverById(cover.id)) }}
    />
  )
}
