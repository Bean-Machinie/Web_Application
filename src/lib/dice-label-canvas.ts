// The parts every drawn label shares.
export function newCanvas(size: number) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  return { canvas, ctx: canvas.getContext("2d")! }
}

// The library takes pictures, not canvases.
export async function toImage(canvas: HTMLCanvasElement) {
  const image = new Image()
  image.src = canvas.toDataURL("image/png")
  await image.decode()
  return image
}

// The same figure for a value every time, but not the same for every value.
export function seedOf(text: string) {
  return [...text].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7)
}
