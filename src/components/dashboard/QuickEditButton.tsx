import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

// The small pencil at the end of a section's header or a row, which opens its panel.
export function QuickEditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon-xs" aria-label={label} className="text-muted-foreground shrink-0" onClick={onClick}>
      <Pencil />
    </Button>
  )
}
