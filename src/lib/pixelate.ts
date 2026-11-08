// A 4 by 4 ordered-dither pattern, for the faint grain on the coarse blocks.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
export const COARSEST_BLOCK = 10

// Where an image fits whole in a box of the given size, centred, so none of it is cut off.
function contain(image: HTMLImageElement, width: number, height: number) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const w = image.naturalWidth * scale
  const h = image.naturalHeight * scale
  return [(width - w) / 2, (height - h) / 2, w, h] as const
}

// Snaps each block's colour to coarse steps with the dither pattern, more the coarser the blocks. An
// image from another site that does not allow reading its pixels is left as it is.
function dither(buffer: CanvasRenderingContext2D, cols: number, rows: number, step: number) {
  if (step < 2) return
  try {
    const image = buffer.getImageData(0, 0, cols, rows)
    const data = image.data
    for (let i = 0; i < data.length; i += 4) {
      const cell = (i / 4) % cols
      const offset = (BAYER[((Math.floor(i / 4 / cols) % 4) * 4) + (cell % 4)] / 16 - 0.5) * step
      for (let c = 0; c < 3; c++) data[i + c] = Math.round((data[i + c] + offset) / step) * step
    }
    buffer.putImageData(image, 0, 0)
  } catch {
    // Pixels of another origin cannot be read; the blocks stay plain.
  }
}

// Draws the whole image, fitted into the box, in square blocks of the given size, in CSS pixels; at 1
// it is the image itself.
export function drawPixelated(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number, block: number, buffer: HTMLCanvasElement) {
  const [x, y, w, h] = contain(image, width, height)
  if (block <= 1.05) {
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(image, x, y, w, h)
    return
  }
  const cols = Math.ceil(w / block)
  const rows = Math.ceil(h / block)
  buffer.width = cols
  buffer.height = rows
  const small = buffer.getContext("2d", { willReadFrequently: true })
  if (!small) return
  small.drawImage(image, 0, 0, cols, rows)
  dither(small, cols, rows, ((block - 1) / (COARSEST_BLOCK - 1)) * 24)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(buffer, 0, 0, cols, rows, x, y, w, h)
}
