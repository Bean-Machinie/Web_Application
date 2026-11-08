// A 4 by 4 ordered-dither pattern, for the faint grain on the coarse blocks.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
export const COARSEST_BLOCK = 10

// The part of an image that covers a box of the given size, cut from its centre.
function cover(image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const sw = width / scale
  const sh = height / scale
  return [(image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh] as const
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

// Draws an image to cover the box in square blocks of the given size, in CSS pixels; at 1 it is the
// image itself.
export function drawPixelated(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number, block: number, buffer: HTMLCanvasElement) {
  if (block <= 1.05) {
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(image, ...cover(image, width, height), 0, 0, width, height)
    return
  }
  const cols = Math.ceil(width / block)
  const rows = Math.ceil(height / block)
  // The blocks run a little past the box, so the crop covers that.
  const crop = cover(image, cols * block, rows * block)
  buffer.width = cols
  buffer.height = rows
  const small = buffer.getContext("2d", { willReadFrequently: true })
  if (!small) return
  small.drawImage(image, ...crop, 0, 0, cols, rows)
  dither(small, cols, rows, ((block - 1) / (COARSEST_BLOCK - 1)) * 24)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(buffer, 0, 0, cols, rows, 0, 0, cols * block, rows * block)
}
