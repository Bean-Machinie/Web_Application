import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

type Props = {
  icon: LucideIcon
  label: string
  value: string
  // Null reads the value as plain text; a GM gets an input.
  onChange: ((value: string) => void) | null
  numeric?: boolean
}

const quiet =
  "hover:bg-muted focus-visible:bg-background h-10 border-transparent bg-transparent text-center text-xl font-semibold shadow-none md:text-xl dark:bg-transparent dark:hover:bg-muted [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

export function StatTile({ icon: Icon, label, value, onChange, numeric }: Props) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-3">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Icon className="size-3.5" />
        {label}
      </span>
      {onChange ? (
        <Input
          aria-label={label}
          autoComplete="off"
          inputMode={numeric ? "numeric" : undefined}
          type={numeric ? "number" : "text"}
          maxLength={numeric ? undefined : 20}
          placeholder="—"
          className={quiet}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <span className="h-10 truncate text-xl leading-10 font-semibold">{value}</span>
      )}
    </div>
  )
}
