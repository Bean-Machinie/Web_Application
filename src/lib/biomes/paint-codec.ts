import { PAINT_CELL, TILE } from "./biomes"
import { TILE_BYTES } from "./paint-tiles"
import type { Paint, Tile } from "./paint-tiles"

// How paint is kept in the scene: only the tiles that hold any, each squeezed
// and written as text. The cell and tile sizes are kept too, so paint made with
// other sizes is never read as if it were this one.
export type SavedPaint = { cell: number; tile: number; tiles: Record<string, string> }

const KEY = /^\d{1,3},\d{1,3}$/
const CHUNK = 0x8000

async function run(bytes: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream) {
  const piped = new Blob([bytes]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(piped).arrayBuffer())
}

function toText(bytes: Uint8Array) {
  let text = ""
  for (let i = 0; i < bytes.length; i += CHUNK) text += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  return btoa(text)
}

const fromText = (text: string) => Uint8Array.from(atob(text), (character) => character.charCodeAt(0))

// A tile never changes, so its text is made once, however many saves follow.
const written = new WeakMap<Tile, string>()

async function writeTile(tile: Tile) {
  let text = written.get(tile)
  if (text === undefined) {
    text = toText(await run(new Uint8Array(tile), new CompressionStream("deflate-raw")))
    written.set(tile, text)
  }
  return text
}

export async function writePaint(paint: Paint): Promise<SavedPaint> {
  const entries = await Promise.all([...paint].map(async ([key, tile]) => [key, await writeTile(tile)] as const))
  return { cell: PAINT_CELL, tile: TILE, tiles: Object.fromEntries(entries) }
}

// Whatever cannot be read is left out: a map loses some paint, not its scene.
export async function readPaint(saved: unknown): Promise<Paint> {
  const source = saved as Partial<SavedPaint> | null
  const paint = new Map<string, Tile>()
  if (source?.cell !== PAINT_CELL || source.tile !== TILE || typeof source.tiles !== "object" || !source.tiles) {
    return paint
  }
  for (const [key, text] of Object.entries(source.tiles)) {
    if (!KEY.test(key) || typeof text !== "string") continue
    try {
      const tile = await run(fromText(text) as Uint8Array<ArrayBuffer>, new DecompressionStream("deflate-raw"))
      if (tile.length !== TILE_BYTES) continue
      written.set(tile, text)
      paint.set(key, tile)
    } catch {
      continue
    }
  }
  return paint
}
