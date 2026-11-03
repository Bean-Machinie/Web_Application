// A short-lived drawing on the roll result's canvas, in pixels of the window.
export type Effect = {
  // Moves everything on by `dt` seconds; false once nothing is left to draw.
  step: (dt: number) => boolean
  draw: (ctx: CanvasRenderingContext2D) => void
}

export const between = (low: number, high: number) => low + Math.random() * (high - low)

// Several effects run side by side on one canvas.
export function together(...effects: Effect[]): Effect {
  return {
    step: (dt) => effects.map((effect) => effect.step(dt)).some(Boolean),
    draw: (ctx) => effects.forEach((effect) => effect.draw(ctx)),
  }
}
