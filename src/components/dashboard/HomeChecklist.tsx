import { Link } from "react-router-dom"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { HomeSideHeader } from "./HomeSideHeader"

export type ChecklistStep = {
  label: string
  done: boolean
  // A link, or a button when there is only onClick.
  to?: string
  onClick?: () => void
}

const ROW = "hover:bg-accent/50 focus-visible:ring-ring flex h-10 w-full items-center gap-3 rounded-md px-2 text-left text-sm outline-none transition-colors focus-visible:ring-2"

// The first steps for someone new, in the same quiet style as Recently edited. A step ticks when
// the thing it asks for exists; Dismiss hides the list.
export function HomeChecklist({ steps, onDismiss }: { steps: ChecklistStep[]; onDismiss: () => void }) {
  return (
    <aside className="flex flex-col gap-2 border-l pl-6">
      <HomeSideHeader title="Getting started">
        <button type="button" onClick={onDismiss} className="hover:text-foreground transition-colors">
          Dismiss
        </button>
      </HomeSideHeader>
      <div className="flex flex-col">
        {steps.map((step) => {
          const body = (
            <>
              <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full border", step.done && "bg-primary border-primary text-primary-foreground")}>
                {step.done && <Check className="size-3" />}
              </span>
              <span className={cn(step.done && "text-muted-foreground line-through")}>{step.label}</span>
            </>
          )
          return step.to ? (
            <Link key={step.label} to={step.to} className={ROW}>
              {body}
            </Link>
          ) : (
            <button key={step.label} type="button" onClick={step.onClick} className={ROW}>
              {body}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
