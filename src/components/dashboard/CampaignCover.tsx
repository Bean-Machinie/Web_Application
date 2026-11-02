import type { CoverChoice } from "@/lib/campaign-covers"
import { CoverImage } from "./CoverImage"
import { CoverPicker } from "./CoverPicker"

type Props = { cover: CoverChoice; onChange: (cover: CoverChoice) => void }

// The banner at the top of the page, with the button to change it showing on hover.
export function CampaignCover({ cover, onChange }: Props) {
  return (
    <div className="group/cover relative h-[220px] w-full overflow-hidden rounded-lg border">
      <CoverImage cover={cover} />
      <div className="absolute right-3 bottom-3 opacity-0 transition-opacity group-focus-within/cover:opacity-100 group-hover/cover:opacity-100 pointer-coarse:opacity-100">
        <CoverPicker cover={cover} onChange={onChange} />
      </div>
    </div>
  )
}
