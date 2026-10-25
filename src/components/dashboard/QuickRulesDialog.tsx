import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ABILITY_METHODS } from "@/lib/character-templates/srd-5-2-1-quick"
import type { AbilityMethod } from "@/lib/character-templates/srd-5-2-1-quick"
import type { QuickRules } from "@/lib/quick-state"

type Props = { open: boolean; rules: QuickRules; onClose: () => void; onChange: (rules: QuickRules) => void }

// The rules of the table that change how a character starts. Both are the GM’s to decide.
export function QuickRulesDialog({ open, rules, onClose, onChange }: Props) {
  const setLevel = (level: number) => onChange({ ...rules, level: Math.min(Math.max(level, 1), 20) })
  const method = ABILITY_METHODS.find((candidate) => candidate.id === rules.method)!

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Table rules</DialogTitle>
          <DialogDescription>Both change how your character is started. Ask your GM which your table uses.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Starting level</span>
            <span className="text-muted-foreground text-xs">Most campaigns start at level 1. Ask your GM.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Lower level" disabled={rules.level <= 1} onClick={() => setLevel(rules.level - 1)}>
              <Minus />
            </Button>
            <span className="w-6 text-center text-lg font-semibold tabular-nums">{rules.level}</span>
            <Button variant="outline" size="icon" aria-label="Raise level" disabled={rules.level >= 20} onClick={() => setLevel(rules.level + 1)}>
              <Plus />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border px-4 py-3">
          <span className="text-sm font-medium">Ability scores</span>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={rules.method}
            onValueChange={(next) => next && onChange({ ...rules, method: next as AbilityMethod })}
            aria-label="Ability score method"
            className="flex-wrap justify-start"
          >
            {ABILITY_METHODS.map((option) => (
              <ToggleGroupItem key={option.id} value={option.id} className="px-3">{option.label}</ToggleGroupItem>
            ))}
          </ToggleGroup>
          <span className="text-muted-foreground text-xs">{method.note} Ask your GM.</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
