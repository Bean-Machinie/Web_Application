import { Button } from "@/components/ui/button"
import { ABILITY_METHODS } from "@/lib/character-templates/srd-5-2-1-quick"
import type { QuickRules } from "@/lib/quick-state"

type Props = { rules: QuickRules; onRules: () => void }

// The thin bar under the workspace, as the map builder's: at the
// far end the table rules in force, which open the rules.
export function QuickStatusBar({ rules, onRules }: Props) {
  const method = ABILITY_METHODS.find((candidate) => candidate.id === rules.method)!

  return (
    <footer className="bg-background flex h-7 shrink-0 items-center gap-0.5 border-t px-2">
      <span className="flex-1" />
      <Button variant="ghost" size="xs" onClick={onRules} className="text-muted-foreground">
        Level {rules.level} · {method.label}
      </Button>
    </footer>
  )
}
