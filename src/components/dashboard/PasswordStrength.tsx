import { STRENGTH_LABELS, passwordStrength } from "@/lib/password-strength"
import { cn } from "@/lib/utils"

const COLORS = ["", "bg-destructive", "bg-amber-500", "bg-lime-500", "bg-emerald-500"]

export function PasswordStrength({ password, minLength }: { password: string; minLength: number }) {
  if (!password) return null
  const score = passwordStrength(password, minLength)

  return (
    <div className="mt-2 flex items-center gap-3" role="status" aria-label={`Strength: ${STRENGTH_LABELS[score]}`}>
      <div className="grid flex-1 grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn("h-1 rounded-full transition-colors", step <= score ? COLORS[score] : "bg-muted")}
          />
        ))}
      </div>
      <span className="text-muted-foreground w-14 text-right text-xs">{STRENGTH_LABELS[score]}</span>
    </div>
  )
}
