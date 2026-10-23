// The sizes a map's canvas may have. A canvas pixel is what the ink line, the paint grid
// and the art are measured in, so too small a canvas makes them heavy, and too large a
// one costs the builder more than it gives: the published picture is capped (see
// RENDER_PIXELS in map-scene.ts) whatever the canvas is.
export const MIN_SIDE = 1024
export const MAX_SIDE = 8192
export const MAX_AREA = 25_000_000
export const MAX_RATIO = 4

// Why a size is not allowed, or null if it is.
export function sizeProblem(width: number, height: number): string | null {
  if (!Number.isInteger(width) || !Number.isInteger(height)) return "Enter a whole width and height."
  if (width < MIN_SIDE || height < MIN_SIDE || width > MAX_SIDE || height > MAX_SIDE) {
    return `Each side must be ${MIN_SIDE}–${MAX_SIDE} px.`
  }
  if (width * height > MAX_AREA) return "The area can be at most 25 million px."
  if (Math.max(width, height) / Math.min(width, height) > MAX_RATIO) {
    return `The ratio can be at most ${MAX_RATIO}:1.`
  }
  return null
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

// "16:9" when the size reduces to a simple ratio, else "1.78:1" (width to height).
export function ratioText(width: number, height: number) {
  if (!(width > 0 && height > 0)) return ""
  const divisor = gcd(width, height)
  const [across, down] = [width / divisor, height / divisor]
  if (Number.isInteger(width) && Number.isInteger(height) && Math.max(across, down) <= 20) {
    return `${across}:${down}`
  }
  return `${(width / height).toFixed(2)}:1`
}
