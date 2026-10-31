import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// The small pencil at the end of a section's header or a row, which opens its panel.
export function QuickEditButton({ label, onClick, className }: { label: string; onClick: () => void; className?: string }) {
  return (
    <Button variant="ghost" size="icon-xs" aria-label={label} className={cn("text-muted-foreground shrink-0", className)} onClick={onClick}>
      <Pencil />
    </Button>
  )
}
