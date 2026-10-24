import { HoverIcon } from "@/components/icons/HoverIcon"
import { EyeOffIcon } from "@/components/icons/EyeOffIcon"
import type { WorldFieldsState } from "./WorldFields"
import { SaveIndicator } from "./SaveIndicator"

type Props = {
  canManage: boolean
  revealed: boolean
  saveState: WorldFieldsState["saveState"]
}

// What a GM needs to know of the entry at a glance: whether it is saved, and
// whether players cannot see it.
export function EntryStatus({ canManage, revealed, saveState }: Props) {
  return (
    <>
      {canManage && <SaveIndicator state={saveState} />}
      {!revealed && (
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <HoverIcon icon={EyeOffIcon} size={14} />
          Hidden
        </span>
      )}
    </>
  )
}
