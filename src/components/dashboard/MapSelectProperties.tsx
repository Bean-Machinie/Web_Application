import { Button } from "@/components/ui/button"

const GESTURES: [string, string][] = [
  ["Click", "Select art"],
  ["Shift+click", "Add or remove"],
  ["Drag on empty canvas", "Box select"],
  ["Shift+drag box", "Add to selection"],
  ["Alt+drag", "Duplicate"],
  ["Shift while scaling", "Free scale"],
  ["Shift while turning", "Snap to 15°"],
]

type Props = { hasAssets: boolean; onSelectAll: () => void }

// Select has nothing to set: what its gestures do, and select all.
export function MapSelectProperties({ hasAssets, onSelectAll }: Props) {
  return (
    <>
      <Button variant="outline" size="sm" disabled={!hasAssets} onClick={onSelectAll}>
        Select all
      </Button>
      <dl className="grid gap-1.5 text-xs">
        {GESTURES.map(([gesture, effect]) => (
          <div key={gesture} className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{gesture}</dt>
            <dd className="text-right">{effect}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}
