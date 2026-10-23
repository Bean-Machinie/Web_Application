// The sizes the New map dialog offers as presets: four shapes, each Standard and Large,
// in either orientation. A canvas of any other size is Custom. Large is a long side of
// 6144 where that fits the area limit (see map-canvas-size.ts); 4:3 would not (6144 ×
// 4608 is over it), so its large size is 5632 × 4224, and a square's is 4096 × 4096.
export type FixedShape = "3:2" | "4:3" | "16:9" | "1:1"
export type Scale = "standard" | "large"
export type PresetKey = `${FixedShape}/${Scale}`

// Width and height, landscape.
const SIZES: Record<FixedShape, Record<Scale, [number, number]>> = {
  "3:2": { standard: [3072, 2048], large: [6144, 4096] },
  "4:3": { standard: [3072, 2304], large: [5632, 4224] },
  "16:9": { standard: [3840, 2160], large: [6144, 3456] },
  "1:1": { standard: [3072, 3072], large: [4096, 4096] },
}

const SCALE_NAME: Record<Scale, string> = { standard: "Standard", large: "Large" }

export const PRESETS = (Object.keys(SIZES) as FixedShape[]).flatMap((shape) =>
  (Object.keys(SCALE_NAME) as Scale[]).map((scale) => ({
    key: `${shape}/${scale}` as PresetKey,
    shape,
    scale,
    label: `${shape} ${SCALE_NAME[scale]}`,
  }))
)

export const presetLabel = (key: PresetKey) => PRESETS.find((preset) => preset.key === key)!.label

export function presetSize(key: PresetKey, portrait: boolean) {
  const [shape, scale] = key.split("/") as [FixedShape, Scale]
  const [long, short] = SIZES[shape][scale]
  return portrait ? { width: short, height: long } : { width: long, height: short }
}
