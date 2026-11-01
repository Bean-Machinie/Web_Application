const toLinear = (value: number) => (value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4))

// Any CSS colour as linear RGB in 0-1, which is what the shader mixes in; it turns the result
// back to sRGB itself. The browser does the parsing, through a one pixel canvas.
export function toLinearRgb(color: string): Float32Array {
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!probe) return new Float32Array(3)
  probe.fillStyle = "#000000"
  probe.fillStyle = color
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return Float32Array.from([r, g, b], (channel) => toLinear(channel / 255))
}
