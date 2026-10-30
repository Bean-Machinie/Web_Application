import { useState } from "react"
import { Ellipsis } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { choiceState } from "@/lib/character-choices"
import { isEdited } from "@/lib/character-derive"
import { featById } from "@/lib/character-templates/srd-5-2-1-feats"
import type { SheetActions } from "./character-actions"
import { PickList } from "./PickList"

type Props = { draft: Record<string, unknown>; onDraft: (next: Record<string, unknown>) => void; onPreview: (next: Record<string, unknown> | null) => void; actions: SheetActions }

// The feat the background gives, fixed. The template lets it be changed as a house rule: the
// choice is kept as the player's own, and the feat then shows as edited.
export function PickOriginFeat({ draft, onDraft, onPreview, actions }: Props) {
  const field = actions.byId.get("origin-feat")
  const [changing, setChanging] = useState(false)
  if (!field) return null
  const { options, selected } = choiceState(field, actions.byId, actions.derived)
  const edited = isEdited(field, actions.values)
  const picked = (draft["origin-feat"] as string | null) ?? selected?.id ?? null
  const feat = featById(options.find((option) => option.id === picked)?.label ?? "")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 rounded-lg border border-dashed px-3.5 py-3 text-sm">
        <span className="flex items-center justify-between gap-2">
          <span className="font-medium">{options.find((option) => option.id === picked)?.label ?? "None"}</span>
          <span className="flex items-center gap-1">
            {edited && <Badge variant="secondary">Edited</Badge>}
            {field.overrideLabel && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="More options">
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setChanging(true)}>{field.overrideLabel}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </span>
        </span>
        {feat && <span className="text-muted-foreground text-xs">{feat.benefit}</span>}
      </div>
      {changing ? (
        <PickList
          options={options.map((option) => ({ id: option.id, label: option.label, note: featById(option.label)?.benefit }))}
          value={picked ? [picked] : []}
          count={1}
          label="Origin feat"
          onChange={(next) => onDraft({ "origin-feat": next[0] ?? null })}
          onPreview={(next) => onPreview(next ? { "origin-feat": next[0] } : null)}
        />
      ) : null}
    </div>
  )
}
