import { useEffect, useRef } from "react"
import { useAnimate } from "motion/react"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  disabled: boolean
  onChange: (value: string) => void
  // How many times creating was tried; each try without a name asks for one.
  attempts: number
}

const SHAKE = { x: [0, -8, 8, -6, 6, -3, 0] }

// The campaign's name: a large field with a faint border that firms up, with a pencil, when it
// is pointed at or in use. A required field: trying to go on without a name brings the cursor
// here, shakes it and says so under it.
export function CampaignTitle({ value, disabled, onChange, attempts }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const missing = attempts > 0 && value.trim() === ""

  useEffect(() => {
    if (attempts === 0 || value.trim() !== "") return
    input.current?.focus()
    void animate(scope.current, SHAKE, { duration: 0.4 })
    // Only a new try asks, not the typing that follows it.
  }, [attempts])

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div ref={scope} className="group/title relative">
        <input
          ref={input}
          autoFocus
          required
          aria-label="Campaign name"
          aria-invalid={missing}
          maxLength={60}
          value={value}
          disabled={disabled}
          placeholder="Name your campaign"
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "bg-card placeholder:text-muted-foreground/60 w-full rounded-lg border border-border/50 px-4 py-2 pr-12 text-3xl font-semibold tracking-tight transition-colors outline-none",
            "hover:border-border focus:border-ring",
            missing && "border-destructive hover:border-destructive focus:border-destructive"
          )}
        />
        <Pencil className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 opacity-0 transition-opacity group-focus-within/title:opacity-100 group-hover/title:opacity-100" />
      </div>
      {/* One line, kept in place, so the page below does not shift. */}
      <p className={cn("h-5 text-sm", missing ? "text-destructive" : "text-muted-foreground")}>
        {missing ? "Give your campaign a name" : "You'll be the GM and can invite players afterwards."}
      </p>
    </div>
  )
}
