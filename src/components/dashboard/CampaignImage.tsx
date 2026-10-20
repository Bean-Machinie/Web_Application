import { cn } from "@/lib/utils"
import { CampaignEmblem } from "./CampaignEmblem"

type Props = { name: string; imageUrl: string | null; className?: string }

// The campaign's image, or its emblem, in a rounded square. Size it with
// className.
export function CampaignImage({ name, imageUrl, className }: Props) {
  return (
    <div
      className={cn(
        "bg-muted size-10 shrink-0 overflow-hidden rounded-lg border [&>div]:rounded-none",
        className
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="size-full object-cover" />
      ) : (
        <CampaignEmblem name={name} />
      )}
    </div>
  )
}
