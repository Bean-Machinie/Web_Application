import { assetById } from "./map-assets"

// The longest side of a thumbnail, in pixels: twice the largest a tile is shown,
// for sharp screens.
const SIZE = 240
// How many pictures are being shrunk at once, so a long library never stalls the page.
const AT_ONCE = 2

const ready = new Map<string, string>()
const pending = new Map<string, Promise<string | null>>()
const queue: (() => void)[] = []
let running = 0

function next() {
  while (running < AT_ONCE && queue.length > 0) {
    running++
    queue.shift()!()
  }
}

async function shrink(url: string): Promise<string> {
  const whole = await createImageBitmap(await (await fetch(url)).blob())
  const factor = Math.min(1, SIZE / Math.max(whole.width, whole.height))
  const small = await createImageBitmap(whole, {
    resizeWidth: Math.max(1, Math.round(whole.width * factor)),
    resizeHeight: Math.max(1, Math.round(whole.height * factor)),
    resizeQuality: "high",
  })
  whole.close()
  const canvas = document.createElement("canvas")
  canvas.width = small.width
  canvas.height = small.height
  canvas.getContext("2d")!.drawImage(small, 0, 0)
  small.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85))
  if (!blob) throw new Error("Could not encode the thumbnail")
  return URL.createObjectURL(blob)
}

// A small picture of a piece of art for the library, made once and kept for as
// long as the page is open; the full-size art is not loaded for it. Art that cannot
// be shrunk (a drawing without a size) is shown as it is.
export function thumbnail(id: string): Promise<string | null> {
  const done = ready.get(id)
  if (done) return Promise.resolve(done)
  const known = pending.get(id)
  if (known) return known
  const asset = assetById(id)
  if (!asset) return Promise.resolve(null)
  const promise = new Promise<string | null>((resolve) => {
    queue.push(() => {
      shrink(asset.url)
        .catch(() => asset.url)
        .then((url) => {
          ready.set(id, url)
          resolve(url)
        })
        .finally(() => {
          running--
          next()
        })
    })
    next()
  })
  pending.set(id, promise)
  return promise
}

export const readyThumbnail = (id: string) => ready.get(id) ?? null
