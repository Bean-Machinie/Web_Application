import { ImageIcon } from "lucide-react"
import type { CoverChoice } from "@/lib/campaign-covers"
import { CoverImage } from "./CoverImage"
import { CoverPicker } from "./CoverPicker"

type Props = {
  cover: CoverChoice
  onChange: (cover: CoverChoice) => void
  fallback: CoverChoice
}

// The campaign's cover, a square. Pointing at it darkens it and offers to change it; pressing it
// opens the choice of covers.
export function CampaignCover({ cover, onChange, fallback }: Props) {
  return (
    <CoverPicker cover={cover} onChange={onChange} fallback={fallback}>
      <button
        type="button"
        aria-label="Change cover"
        className="group/cover focus-visible:ring-ring relative size-48 shrink-0 cursor-pointer overflow-hidden rounded-xl border outline-none focus-visible:ring-2"
      >
        <CoverImage cover={cover} />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 text-white opacity-0 transition-opacity duration-200 group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100 pointer-coarse:opacity-100">
          <ImageIcon className="size-6" />
          <span className="text-xs font-medium">Change cover</span>
        </span>
      </button>
    </CoverPicker>
  )
}
