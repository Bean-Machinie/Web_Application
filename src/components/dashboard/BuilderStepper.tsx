import { Check } from "lucide-react"
import { BUILDER_STEPS } from "@/lib/character-builder"
import type { BuilderStep, StepProgress } from "@/lib/character-builder"
import { cn } from "@/lib/utils"

type Props = {
  step: BuilderStep
  progress: Record<BuilderStep, StepProgress>
  onStep: (step: BuilderStep) => void
}

// The five steps along the top. A step that is done shows its choice ("Class: Fighter");
// every step can be opened, in any order.
export function BuilderStepper({ step, progress, onStep }: Props) {
  return (
    <ol className="grid grid-cols-5 gap-2">
      {BUILDER_STEPS.map((item, index) => {
        const { done, choice } = progress[item.id]
        return (
          <li key={item.id}>
            <button
              type="button"
              aria-current={item.id === step ? "step" : undefined}
              onClick={() => onStep(item.id)}
              className={cn(
                "hover:bg-accent focus-visible:ring-ring flex h-12 w-full items-center gap-2.5 rounded-lg border px-3 text-left outline-none focus-visible:ring-2",
                item.id === step ? "border-foreground/30 bg-accent" : "bg-card"
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium",
                  done && "bg-primary border-primary text-primary-foreground"
                )}
              >
                {done ? <Check className="size-3" /> : index + 1}
              </span>
              <span className="min-w-0 truncate text-sm font-medium">
                {item.label}
                {done && choice && <span className="text-muted-foreground font-normal">: {choice}</span>}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
