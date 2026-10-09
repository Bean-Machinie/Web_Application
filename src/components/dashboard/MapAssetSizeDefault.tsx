import { useState, useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { categorySizeOf, sizeOfPlaced } from "@/lib/map-assets"
import { getSizes, saveOwnSize, subscribeSizes } from "@/lib/map-asset-sizes"
import type { PlacedAsset } from "@/lib/map-scene"

type Props = { asset: PlacedAsset; trim: { width: number; height: number } }

const show = (size: number) => size.toFixed(2)

// Development only (the panel leaves this out of a built app): the size of a piece of
// art for everyone who places it from now on. "Set as default size" writes the size of
// this piece, as it is, into sizes.json; "Reset" takes it out, so the category's is
// used. Pieces already on a map are not changed.
export function MapAssetSizeDefault({ asset, trim }: Props) {
  const own = useSyncExternalStore(subscribeSizes, getSizes)[asset.asset]
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function change(size: number | null) {
    setBusy(true)
    try {
      await saveOwnSize(asset.asset, size)
      setMessage(size === null ? "Back to the category's size." : `Saved ${show(size)}.`)
    } catch (failure) {
      setMessage(failure instanceof Error ? failure.message : "Could not save.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-2 border-t pt-3">
      <p className="text-muted-foreground text-xs">
        {own === undefined
          ? `Uses its category's size, ${show(categorySizeOf(asset.asset))}.`
          : `Has its own size, ${show(own)}.`}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void change(Math.round(sizeOfPlaced(trim, asset.scaleX, asset.scaleY) * 1000) / 1000)}
        >
          Set as default size
        </Button>
        <Button variant="ghost" size="sm" disabled={busy || own === undefined} onClick={() => void change(null)}>
          Reset to category size
        </Button>
      </div>
      {message && <p className="text-muted-foreground text-xs">{message}</p>}
    </div>
  )
}
