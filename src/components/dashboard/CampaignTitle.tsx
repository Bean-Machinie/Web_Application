import { useEffect, useRef } from "react"
import { useAnimate } from "motion/react"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  // The line under the name; asking for a name replaces it.
  description: string
  disabled: boolean
  onChange: (value: string) => void
  // How many times creating was tried; each try without a name asks for one.
  attempts: number
}

const SHAKE = { x: [0, -8, 8, -6, 6, -3, 0] }

// The campaign's name: large text on an underline that darkens when pointed at or in use,
// with a pencil after it. A required field: trying to go on without a name brings the cursor
// here, shakes it and says so under it.
export function CampaignTitle({ value, description, disabled, onChange, attempts }: Props) {
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
    <div className="flex min-w-0 flex-col gap-1.5">
      <div
        ref={scope}
        className={cn(
          "group/title flex items-center gap-3 border-b transition-colors",
          "hover:border-foreground focus-within:border-foreground",
          missing && "border-destructive hover:border-destructive focus-within:border-destructive"
        )}
      >
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
          className="placeholder:text-muted-foreground/60 min-w-0 flex-1 bg-transparent py-1 text-3xl font-semibold tracking-tight outline-none"
        />
        <Pencil className="text-muted-foreground group-hover/title:text-foreground group-focus-within/title:text-foreground size-5 shrink-0 transition-colors" />
      </div>
      {/* One line, kept in place, so the page below does not shift. */}
      <p className={cn("h-5 truncate text-sm", missing ? "text-destructive" : "text-muted-foreground")}>
        {missing ? "Give your campaign a name" : description}
      </p>
    </div>
  )
}
