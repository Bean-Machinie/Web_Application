import { canvasToWebp } from "./encode-webp"

export type DefaultCover = {
  id: string
  label: string
  // Top-left to bottom-right.
  colors: [string, string]
}

// What a new campaign's cover is: one of the defaults, or a picture the person added.
export type CoverChoice =
  | { kind: "default"; id: string }
  | { kind: "upload"; file: File; url: string }

export const DEFAULT_COVERS: DefaultCover[] = [
  { id: "willowbrook", label: "Willowbrook", colors: ["#3f6b3a", "#c9a24a"] },
  { id: "ember", label: "Ember", colors: ["#7a2e1d", "#e0894a"] },
  { id: "dusk", label: "Dusk", colors: ["#2b2a5c", "#b4568a"] },
  { id: "tide", label: "Tide", colors: ["#123c5c", "#3fb0a4"] },
  { id: "frost", label: "Frost", colors: ["#2c4a63", "#9cc5dd"] },
  { id: "moss", label: "Moss", colors: ["#1f3d2e", "#7a9a4a"] },
  { id: "dune", label: "Dune", colors: ["#6b4a22", "#e3c27a"] },
  { id: "nightfall", label: "Nightfall", colors: ["#14161f", "#4a4f78"] },
]

// What a campaign without a picture shows where a square cover is wanted.
export const FALLBACK_COVER_IMAGE = "/templates/starter-village/willowbrook.webp"

export const gradientOf = ({ colors }: DefaultCover) =>
  `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`

export const defaultCoverById = (id: string) =>
  DEFAULT_COVERS.find((cover) => cover.id === id) ?? DEFAULT_COVERS[0]

export const randomCover = (): CoverChoice => ({
  kind: "default",
  id: DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)].id,
})

const WIDTH = 1600
const HEIGHT = 400

// A default cover as a picture, so it can be stored as the campaign's image like an upload.
export async function renderCoverFile(cover: DefaultCover) {
  const canvas = document.createElement("canvas")
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext("2d")!
  const fill = context.createLinearGradient(0, 0, WIDTH, HEIGHT)
  fill.addColorStop(0, cover.colors[0])
  fill.addColorStop(1, cover.colors[1])
  context.fillStyle = fill
  context.fillRect(0, 0, WIDTH, HEIGHT)
  const glow = context.createRadialGradient(WIDTH * 0.7, HEIGHT * 0.2, 0, WIDTH * 0.7, HEIGHT * 0.2, WIDTH * 0.5)
  glow.addColorStop(0, "rgba(255,255,255,0.18)")
  glow.addColorStop(1, "rgba(255,255,255,0)")
  context.fillStyle = glow
  context.fillRect(0, 0, WIDTH, HEIGHT)
  const blob = await canvasToWebp(canvas, 0.9)
  return new File([blob], `${cover.id}.webp`, { type: "image/webp" })
}
