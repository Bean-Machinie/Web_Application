import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { MultiPolygon } from "polygon-clipping"
import landGrainUrl from "@/assets/textures/land-grain.png"
import waterGrainUrl from "@/assets/textures/water-grain.png"
import { PAINT_CELL, TILE } from "@/lib/biomes/biomes"
import type { Paint } from "@/lib/biomes/paint-tiles"
import type { Surface } from "@/lib/biomes/surface"
import { indexPieces, makePieces } from "@/lib/map-asset-pieces"
import type { Piece, Rect } from "@/lib/map-asset-pieces"
import { createPictures } from "@/lib/map-asset-pictures"
import type { Ground } from "@/lib/map-ground"
import type { MapScene, PlacedAsset } from "@/lib/map-scene"
import { themeFor } from "@/lib/map-theme"
import { useAssetInfos } from "./use-asset-infos"
import type { BuilderView } from "./use-builder-viewport"
import { useTexture } from "./use-texture"

// The sharp picture covers what is in sight with this much extra around it, so
// that panning a little needs no new picture, and is never made larger than this.
const MARGIN = 0.25
const MAX_PIXELS = 4_000_000
// Zooming and panning wait this long to settle before the sharp picture is made.
const SETTLE_MS = 90
// Soft edges and rounding mean a change reaches this far past its piece.
const REACH = 2
// More changed places than this are redrawn as one.
const MANY = 24

type Marks = Map<string, { key: string; box: Rect }>

const marksOf = (pieces: Piece[]): Marks =>
  new Map(
    pieces.map(({ asset, box }) => [
      asset.id,
      { key: `${asset.asset}|${asset.x}|${asset.y}|${asset.scaleX}|${asset.scaleY}|${asset.rotation}`, box },
    ])
  )

// Where the pieces differ: the places the old ones were and the new ones are.
function changedPieces(before: Marks, after: Marks) {
  const rects: Rect[] = []
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const old = before.get(id)
    const next = after.get(id)
    if (old?.key === next?.key) continue
    if (old) rects.push(old.box)
    if (next) rects.push(next.box)
  }
  return rects
}

// Where the biome paint differs, as the tiles that changed.
function changedPaint(before: Paint, after: Paint) {
  const size = TILE * PAINT_CELL
  const rects: Rect[] = []
  for (const key of new Set([...before.keys(), ...after.keys()])) {
    if (before.get(key) === after.get(key)) continue
    const [tx, ty] = key.split(",").map(Number)
    rects.push({ x: tx * size, y: ty * size, width: size, height: size })
  }
  return rects
}

const together = (rects: Rect[]): Rect[] => {
  if (rects.length <= MANY) return rects
  const x0 = Math.min(...rects.map((r) => r.x))
  const y0 = Math.min(...rects.map((r) => r.y))
  const x1 = Math.max(...rects.map((r) => r.x + r.width))
  const y1 = Math.max(...rects.map((r) => r.y + r.height))
  return [{ x: x0, y: y0, width: x1 - x0, height: y1 - y0 }]
}

type Input = {
  assets: PlacedAsset[]
  // The pieces being moved, which draw themselves while they are.
  hidden: ReadonlySet<string>
  // The land as it is shown, rounded.
  land: MultiPolygon
  paint: Paint
  surface: Surface
  canvas: MapScene["canvas"]
  // The sheet or sea under everything.
  backdrop: HTMLCanvasElement
  view: BuilderView
  size: { width: number; height: number }
}

// The pictures of the placed art: an overview of the whole canvas and a sharp
// one of what is in sight (see createPictures). A change to the art or to the
// paint under it redraws only the places near it; a change to the land, or to
// what the ground is made of, redraws everything.
export function useAssetPictures(input: Input) {
  const { assets, hidden, land, paint, surface, canvas, backdrop, view, size } = input
  const { width, height, background } = canvas
  const pictures = useMemo(() => createPictures({ width, height }), [width, height])
  const infoOf = useAssetInfos(assets.map((asset) => asset.asset))
  const [version, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((current) => current + 1), [])
  const seaGrain = useTexture(waterGrainUrl)
  const landGrain = useTexture(landGrainUrl)

  // Art that has loaded since last time is drawable now.
  const loaded = new Set(assets.filter((asset) => infoOf(asset.asset)).map((asset) => asset.asset)).size
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const pieces = useMemo(() => makePieces(assets, infoOf, hidden), [assets, hidden, loaded])

  const theme = themeFor(background)
  const colours = useMemo(() => ({ ink: theme.ink, fill: theme.land.fill }), [theme])
  const painted = paint.size > 0
  const ground = useMemo<Ground>(
    () => ({
      canvas: { width, height },
      background,
      backdrop,
      seaGrain,
      landGrain,
      land,
      biomes: painted ? surface.picture : null,
    }),
    [width, height, background, backdrop, seaGrain, landGrain, land, surface, painted]
  )
  const drawing = useMemo(
    () => ({ pieces, near: indexPieces(pieces, { width, height }), ground, colours }),
    [pieces, ground, colours, width, height]
  )

  useEffect(() => pictures.onLate(bump), [pictures, bump])

  const last = useRef<{ pictures: typeof pictures; ground: Ground; marks: Marks; paint: Paint } | null>(null)
  useEffect(() => {
    pictures.use(drawing)
    const before = last.current
    const marks = marksOf(pieces)
    last.current = { pictures, ground, marks, paint }
    if (!before || before.pictures !== pictures || before.ground !== ground) {
      void pictures.bakeOverview().then(bump)
      return
    }
    const rects = together([...changedPieces(before.marks, marks), ...changedPaint(before.paint, paint)])
    if (rects.length === 0) return
    pictures.patch(rects.map((r) => ({ x: r.x - REACH, y: r.y - REACH, width: r.width + REACH * 2, height: r.height + REACH * 2 })))
    bump()
  }, [pictures, drawing, ground, pieces, paint, bump])

  useEffect(() => {
    const timer = setTimeout(() => {
      const left = Math.max(-view.x / view.scale - (size.width / view.scale) * MARGIN, 0)
      const top = Math.max(-view.y / view.scale - (size.height / view.scale) * MARGIN, 0)
      const right = Math.min((size.width - view.x) / view.scale + (size.width / view.scale) * MARGIN, width)
      const bottom = Math.min((size.height - view.y) / view.scale + (size.height / view.scale) * MARGIN, height)
      if (right <= left || bottom <= top) return
      const region = { x: left, y: top, width: right - left, height: bottom - top }
      const wanted = view.scale * window.devicePixelRatio
      const scale = Math.min(wanted, Math.sqrt(MAX_PIXELS / (region.width * region.height)))
      void pictures.bakeView(region, scale).then((done) => done && bump())
    }, SETTLE_MS)
    return () => clearTimeout(timer)
  }, [pictures, ground, view, size, width, height, bump])

  return { pictures, version }
}
