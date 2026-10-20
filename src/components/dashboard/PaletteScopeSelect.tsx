import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PaletteScope } from "@/lib/palette-groups"

const SCOPE_LABELS: Record<PaletteScope, string> = {
  everywhere: "Everywhere",
  campaign: "This campaign",
  campaigns: "Campaigns",
  library: "Library",
}

type Props = {
  scope: PaletteScope
  // "This campaign" only exists inside a campaign.
  scopes: PaletteScope[]
  onChange: (scope: PaletteScope) => void
  // Called when the menu closes, so the search field can take focus back.
  onClosed: () => void
}

// Where the palette searches, at the right end of its input.
export function PaletteScopeSelect({ scope, scopes, onChange, onClosed }: Props) {
  return (
    <Select value={scope} onValueChange={(value) => onChange(value as PaletteScope)}>
      <SelectTrigger
        size="sm"
        aria-label="Search in"
        className="text-muted-foreground border-transparent bg-transparent px-2 text-xs shadow-none dark:bg-transparent"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="end"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onClosed()
        }}
      >
        {scopes.map((option) => (
          <SelectItem key={option} value={option}>
            {SCOPE_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
