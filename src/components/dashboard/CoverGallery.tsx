import { Check } from "lucide-react"
import { DEFAULT_COVERS, gradientOf } from "@/lib/campaign-covers"
import type { CoverChoice } from "@/lib/campaign-covers"
import { cn } from "@/lib/utils"

type Props = { cover: CoverChoice; onPick: (cover: CoverChoice) => void }

// The default covers, with the current one marked.
export function CoverGallery({ cover, onPick }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {DEFAULT_COVERS.map((option) => {
        const current = cover.kind === "default" && cover.id === option.id
        return (
          <button
            key={option.id}
            type="button"
            aria-label={option.label}
            aria-pressed={current}
            onClick={() => onPick({ kind: "default", id: option.id })}
            style={{ background: gradientOf(option) }}
            className={cn(
              "focus-visible:ring-ring relative flex aspect-video items-end justify-center rounded-md border outline-none focus-visible:ring-2",
              current && "ring-primary ring-2"
            )}
          >
            {current && (
              <span className="bg-background text-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full">
                <Check className="size-3" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
