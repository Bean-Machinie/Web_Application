import { MotionConfig, motion } from "motion/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BUILDER_STEPS } from "@/lib/character-builder"
import type { BuilderStep, StepProgress } from "@/lib/character-builder"
import { cn } from "@/lib/utils"
import { BuilderStepMarker } from "./BuilderStepMarker"

type Props = {
  step: BuilderStep
  progress: Record<BuilderStep, StepProgress>
  onStep: (step: BuilderStep) => void
}

// The seven steps in one line: a marker and the name, joined by short lines that fill as steps
// are finished. What is chosen shows in a tooltip. Steps ahead of the open one that are not
// finished cannot be opened yet. Below 1100px only the markers and the open step's name show.
export function BuilderStepper({ step, progress, onStep }: Props) {
  const current = BUILDER_STEPS.findIndex((item) => item.id === step)
  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Builder steps" className="flex h-12 min-w-0 items-center gap-3">
        <ol className="flex min-w-0 items-center">
          {BUILDER_STEPS.map((item, index) => {
            const open = index === current
            const done = progress[item.id].done
            const reached = open || done || index < current
            return (
              <li key={item.id} className="flex min-w-0 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={!reached}
                      aria-current={open ? "step" : undefined}
                      aria-label={item.label}
                      onClick={() => onStep(item.id)}
                      className="focus-visible:ring-ring flex min-w-0 items-center gap-2 rounded-md p-1 outline-none focus-visible:ring-2 disabled:cursor-default"
                    >
                      <BuilderStepMarker number={index + 1} state={open ? "current" : done ? "complete" : "upcoming"} />
                      <span className={cn("hidden truncate text-[13px] min-[1100px]:inline", open ? "font-semibold" : "text-muted-foreground")}>{item.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{progress[item.id].summary}</TooltipContent>
                </Tooltip>
                {index < BUILDER_STEPS.length - 1 && (
                  <span aria-hidden className="bg-border relative mx-1 h-0.5 w-3 shrink-0 overflow-hidden rounded-full min-[1100px]:w-6">
                    <motion.span
                      className="bg-primary absolute inset-0 origin-left"
                      initial={false}
                      animate={{ scaleX: done ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </span>
                )}
              </li>
            )
          })}
        </ol>
        <span className="text-muted-foreground truncate text-sm min-[1100px]:hidden">
          Step {current + 1} of {BUILDER_STEPS.length} · {BUILDER_STEPS[current].label}
        </span>
      </nav>
    </MotionConfig>
  )
}
