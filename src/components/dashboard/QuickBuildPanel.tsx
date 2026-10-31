import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MapToolSections } from "./MapToolSections"

type Props = { level: number; showSuggestions: boolean; onShowSuggestions: (show: boolean) => void }

// The left panel of the Build workspace, made as the map builder's tool panel is: a section with
// its bar and, under it, the settings of the build. The level is fixed at 1 for now, so it is
// shown and cannot be changed; the suggestions are the words the sentence writes ahead.
export function QuickBuildPanel({ level, showSuggestions, onShowSuggestions }: Props) {
  return (
    <MapToolSections
      layoutId="quick-builder-panel"
      sections={[
        {
          id: "main",
          title: "Build settings",
          content: (
            <div className="grid gap-4 p-3">
              <div className="grid gap-2">
                <Label htmlFor="quick-level" className="text-muted-foreground text-xs font-normal">Level</Label>
                <Select value={String(level)} disabled>
                  <SelectTrigger id="quick-level" className="w-full data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(level)}>{level}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">Characters start at level 1 for now.</p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="quick-suggestions" className="font-normal">Show suggestions</Label>
                <Switch id="quick-suggestions" size="sm" checked={showSuggestions} onCheckedChange={onShowSuggestions} />
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
