import type { ReactNode } from "react"
import { TiltCard } from "@/components/TiltCard"
import { tiltCardSkin } from "@/components/tilt-card-styles"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  description: string
  // A short line under the title, such as what the template contains.
  summary?: string
  cover: ReactNode
  // A quieter, outlined card for starting from nothing.
  dashed?: boolean
  onSelect: () => void
}

// One choice in the gallery; tilts toward the cursor like the other cards.
export function TemplateCard({ title, description, summary, cover, dashed, onSelect }: Props) {
  return (
    <TiltCard
      className={cn(
        "rounded-lg border",
        tiltCardSkin(dashed ? "dashed" : "default"),
        dashed ? "border-dashed bg-transparent" : "bg-card"
      )}
    >
    <button
      type="button"
      onClick={onSelect}
      className="focus-visible:ring-ring flex size-full cursor-pointer flex-col overflow-hidden rounded-[inherit] text-left outline-none focus-visible:ring-2"
    >
      <div
        className={cn(
          "flex aspect-[16/9] items-center justify-center",
          dashed ? "bg-transparent" : "bg-muted/50 border-b"
        )}
      >
        {cover}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <span className="font-medium">{title}</span>
        {summary && <span className="text-muted-foreground text-xs">{summary}</span>}
        <span className="text-muted-foreground text-sm">{description}</span>
      </div>
    </button>
    </TiltCard>
  )
}
