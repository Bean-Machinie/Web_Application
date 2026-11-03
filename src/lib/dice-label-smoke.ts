// A few very faint lighter patches over the whole label, so the glass body reads smoky and not flat.
// They are part of the picture because the library draws no texture for a style that has none.
const PATCHES = 14

export function smoke(ctx: CanvasRenderingContext2D, size: number, seed: number) {
  let state = seed >>> 0 || 1
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 2 ** 32
  }
  for (let i = 0; i < PATCHES; i++) {
    const x = random() * size
    const y = random() * size
    const radius = size * (0.12 + random() * 0.18)
    const patch = ctx.createRadialGradient(x, y, 0, x, y, radius)
    patch.addColorStop(0, `rgba(255, 255, 255, ${0.02 + random() * 0.01})`)
    patch.addColorStop(1, "rgba(255, 255, 255, 0)")
    ctx.fillStyle = patch
    ctx.fillRect(0, 0, size, size)
  }
}
