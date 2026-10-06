// In development, localStorage.setItem("forceWasmWebp", "1") skips the browser's
// own encoder, to try the fallback in a browser that does not need it.
const forced = () => import.meta.env.DEV && localStorage.getItem("forceWasmWebp") === "1"

// Safari ignores "image/webp" in toBlob and hands back a PNG. The encoder is
// loaded only then, so browsers that can encode WebP never download it.
async function encodeInWasm(canvas: HTMLCanvasElement, quality: number) {
  // The encoder blocks the page for a moment: let the busy state paint first.
  // Frames do not run in a background tab, so the wait is capped.
  await new Promise((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve))
    setTimeout(resolve, 100)
  })
  const { default: encode } = await import("@jsquash/webp/encode")
  const { width, height } = canvas
  const pixels = canvas.getContext("2d")!.getImageData(0, 0, width, height)
  const data = await encode(pixels, { quality: Math.round(quality * 100) })
  return new Blob([data], { type: "image/webp" })
}

// Encodes a canvas as WebP, quality from 0 to 1.
export async function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  if (!forced()) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    )
    if (blob?.type === "image/webp") return blob
  }
  return encodeInWasm(canvas, quality).catch(() => {
    throw new Error("This browser could not convert the image to WebP.")
  })
}
