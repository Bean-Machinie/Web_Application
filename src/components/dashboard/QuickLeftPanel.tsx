import type { Workspace } from "@/lib/quick-workspace"
import type { QuickRules } from "@/lib/quick-state"
import type { SheetActions } from "./character-actions"
import { QuickAbilitiesPanel } from "./QuickAbilitiesPanel"
import { QuickBuildPanel } from "./QuickBuildPanel"

type Props = {
  workspace: Workspace
  actions: SheetActions
  rules: QuickRules
  suggestions: boolean
  onSuggestions: (show: boolean) => void
}

// What the left panel holds in each workspace.
export function QuickLeftPanel({ workspace, actions, rules, suggestions, onSuggestions }: Props) {
  return workspace === "build" ? (
    <QuickBuildPanel level={rules.level} showSuggestions={suggestions} onShowSuggestions={onSuggestions} />
  ) : (
    <QuickAbilitiesPanel actions={actions} rules={rules} />
  )
}
