import { Button } from "@/components/ui/button"

type Props = { hasAssets: boolean; onSelectAll: () => void }

// Select has nothing to set: select all. Its gestures are in its help card.
export function MapSelectProperties({ hasAssets, onSelectAll }: Props) {
  return (
    <>
      <Button variant="outline" size="sm" disabled={!hasAssets} onClick={onSelectAll}>
        Select all
      </Button>
    </>
  )
}
