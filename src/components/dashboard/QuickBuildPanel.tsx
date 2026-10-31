import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type Props = { level: number; showSuggestions: boolean; onShowSuggestions: (show: boolean) => void }

// The left panel of the Build workspace: the settings of the build. The level is fixed at 1 for
// now, so it is shown and cannot be changed; the suggestions are the words the sentence writes ahead.
export function QuickBuildPanel({ level, showSuggestions, onShowSuggestions }: Props) {
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <h2 className="text-sm font-semibold">Build settings</h2>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="quick-level" className="text-xs">Level</Label>
        <Select value={String(level)} disabled>
          <SelectTrigger id="quick-level" size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={String(level)}>{level}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">Characters start at level 1 for now.</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="quick-suggestions" className="text-xs">Show suggestions</Label>
        <Switch id="quick-suggestions" checked={showSuggestions} onCheckedChange={onShowSuggestions} />
      </div>
    </div>
  )
}
