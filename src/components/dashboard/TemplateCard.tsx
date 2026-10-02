import type { ReactNode } from "react"
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

// One choice in the gallery; lifts on hover like the World grid cards.
export function TemplateCard({ title, description, summary, cover, dashed, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group focus-visible:ring-ring flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all duration-200 outline-none hover:shadow-md focus-visible:ring-2",
        dashed
          ? "hover:border-foreground/40 border-dashed bg-transparent"
          : "bg-card hover:border-foreground/25"
      )}
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
  )
}
