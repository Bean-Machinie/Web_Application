import { Badge } from "@/components/ui/badge"
import { APPROACHES } from "@/lib/character-templates/srd-5-2-1-quick"
import { cn } from "@/lib/utils"

type Props = {
  classId: string
  // The id the player chose, or none: the first is then suggested.
  chosen: string | null
  onChoose: (id: string) => void
}

// "How do you fight?", under the class card of a class whose primary ability is a choice.
// It decides which ability leads, the kit, the Fighting Style and the weapon masteries.
export function QuickApproach({ classId, chosen, onChoose }: Props) {
  const options = APPROACHES[classId]
  if (!options) return null
  const current = options.find((option) => option.id === chosen)?.id ?? options[0].id

  return (
    <section aria-label="How do you fight?" className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs">
      <h3 className="text-sm font-semibold">How do you fight?</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.id === current}
            onClick={() => onChoose(option.id)}
            className={cn(
              "focus-visible:ring-ring flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left outline-none focus-visible:ring-2",
              option.id === current ? "border-foreground bg-accent" : "hover:bg-accent/50"
            )}
          >
            <span className="flex w-full items-center justify-between gap-2 text-sm font-medium">
              {option.label}
              {option.id === current && chosen === null && <Badge variant="outline" className="h-4 text-[10px]">Suggested</Badge>}
            </span>
            <span className="text-muted-foreground text-xs">{option.line}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
