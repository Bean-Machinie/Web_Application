import { MotionConfig, motion } from "motion/react"
import { BUILDER_STEPS } from "@/lib/character-builder"
import type { BuilderStep, StepProgress } from "@/lib/character-builder"
import { cn } from "@/lib/utils"
import { BuilderStepMarker } from "./BuilderStepMarker"

type Props = {
  step: BuilderStep
  progress: Record<BuilderStep, StepProgress>
  onStep: (step: BuilderStep) => void
}

// The seven steps along the top: a marker each, joined by lines that fill as steps are finished,
// with the name and a line on what is chosen beneath. Steps ahead of the open one that are not
// finished cannot be opened yet. On a narrow screen only the open step's name is shown.
export function BuilderStepper({ step, progress, onStep }: Props) {
  const current = BUILDER_STEPS.findIndex((item) => item.id === step)
  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Builder steps" className="flex flex-col gap-3">
        <ol className="flex">
          {BUILDER_STEPS.map((item, index) => {
            const open = index === current
            const done = progress[item.id].done
            const reached = open || done || index < current
            return (
              <li key={item.id} className="relative flex-1">
                {index < BUILDER_STEPS.length - 1 && (
                  <span aria-hidden className="bg-border absolute top-3 right-2 left-11 h-0.5 overflow-hidden rounded-full">
                    <motion.span
                      className="bg-primary absolute inset-0 origin-left"
                      initial={false}
                      animate={{ scaleX: done ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </span>
                )}
                <button
                  type="button"
                  disabled={!reached}
                  aria-current={open ? "step" : undefined}
                  onClick={() => onStep(item.id)}
                  className="focus-visible:ring-ring flex w-full flex-col items-start gap-2 rounded-md p-1 text-left outline-none focus-visible:ring-2 enabled:cursor-pointer disabled:cursor-default"
                >
                  <BuilderStepMarker number={index + 1} state={open ? "current" : done ? "complete" : "upcoming"} />
                  <span className="hidden h-9 w-full flex-col gap-0.5 pr-2 md:flex">
                    <span className={cn("truncate text-[13px]", open ? "font-semibold" : "text-muted-foreground")}>{item.label}</span>
                    <span className="text-muted-foreground truncate text-xs">{progress[item.id].summary}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <p className="text-sm md:hidden">
          <span className="font-semibold">{BUILDER_STEPS[current].label}</span>
          <span className="text-muted-foreground"> · Step {current + 1} of {BUILDER_STEPS.length}</span>
        </p>
      </nav>
    </MotionConfig>
  )
}
