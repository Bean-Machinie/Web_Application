import { useEffect } from "react"
import { at } from "@/lib/temp-timing" // TEMP-TIMING
import { BIOMES } from "@/lib/biomes/biomes"
import { artFor } from "@/lib/map-asset-art"
import { paintedArtFor } from "@/lib/map-asset-paint"
import { recolours } from "@/lib/map-assets"
import type { AssetInfo } from "@/lib/map-assets"
import type { PlacedAsset, SceneBackground } from "@/lib/map-scene"
import { themeFor } from "@/lib/map-theme"

// Whether a button is down, and when the pointer last moved: kept for the whole
// page, because the art of a piece pressed is wanted by an effect that begins
// while the button is still down.
let pressed = false
let movedAt = 0
const note = (down: boolean | null) => () => {
  if (down !== null) pressed = down
  movedAt = performance.now()
}
window.addEventListener("pointerdown", note(true), true)
window.addEventListener("pointerup", note(false), true)
window.addEventListener("pointercancel", note(false), true)
window.addEventListener("pointermove", note(null), true)
// The biome versions wait for this long without the pointer moving.
const QUIET_MS = 300

// Moving a piece draws it in flat colour from art that is made the first time it
// is wanted, at its size and, for each biome it crosses into, in that biome's
// colours. Made in the middle of a drag, that is a hitch. So the art of the
// selected pieces is made as soon as they are selected, one part at a time, each
// in a task of its own, so that nothing is held up.
export function useAssetWarmup(
  pieces: PlacedAsset[],
  // Pieces only pointed at: their art at its size is made, but not the biome versions.
  pointed: PlacedAsset[],
  infoOf: (id: string) => AssetInfo | undefined,
  scale: number,
  background: SceneBackground
) {
  useEffect(() => {
    // Each job holds the thread for a good while, so none is begun while a button
    // is down, which is when a hitch would show; the heavy ones wait for quiet too.
    const jobs: { run: () => void; heavy: boolean; label: string }[] = []
    const theme = themeFor(background)
    for (const piece of [...pieces, ...pointed]) {
      const lightly = !pieces.includes(piece)
      const info = infoOf(piece.asset)
      if (!info) continue
      const drawn = info.trim.width * Math.abs(piece.scaleX) * scale
      if (!info.colour) {
        jobs.push({ run: () => artFor(piece.asset, info, drawn, theme.ink, theme.land.fill), heavy: false, label: `${piece.asset} ink` })
        continue
      }
      const category = piece.asset.split("/")[0]
      const changes = recolours(category)
      const art = () => paintedArtFor(piece.asset, category, info, drawn, background, changes)
      jobs.push({ run: art, heavy: false, label: `${piece.asset} base${lightly ? " (hover)" : ""}` })
      if (changes && !lightly) for (const biome of BIOMES) jobs.push({ run: () => art().variant(biome), heavy: true, label: `${piece.asset} ${biome}` })
    }
    let timer: ReturnType<typeof setTimeout> | undefined
    const next = () => {
      const job = jobs[0]
      const ready = !pressed && (!job?.heavy || performance.now() - movedAt > QUIET_MS)
      if (ready && job) { // TEMP-TIMING
        const t = performance.now()
        job.run()
        const took = performance.now() - t
        console.log(`${at()} [warm-up] ${job.label} ${took < 3 ? "HIT" : "MISS"} ${took.toFixed(0)}ms | pressed=${pressed} quiet=${(performance.now() - movedAt).toFixed(0)}ms`)
        jobs.shift()
      }
      if (jobs.length > 0) timer = setTimeout(next, ready ? 0 : 100)
    }
    timer = setTimeout(next, 0)
    return () => clearTimeout(timer)
    // The pieces are read when they are selected; a move of one does not change its art.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [pieces.map((p) => `${p.asset}|${p.scaleX}`).join(","), pointed.map((p) => `${p.asset}|${p.scaleX}`).join(","), scale, background])
}
