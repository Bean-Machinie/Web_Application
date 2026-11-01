// Everything to tune in the dithered background, in one place. The look is React Bits' Dither.
export type DitherMode = "bayer" | "bayer4" | "bayer2" | "halftone" | "lines" | "crosshatch" | "noise" | "none"

export const DITHER = {
  waveColor: "#bcbcbc",
  backgroundColor: "#111111",
  ditherMode: "noise" as DitherMode,
  colorNum: 4,
  // The size of a dither cell, in CSS pixels.
  pixelSize: 3,
  waveSpeed: 0.005,
  waveFrequency: 4.5,
  waveAmplitude: 0.3,
  scale: 1.95,
  brightness: -0.08,
  contrast: 1,
  // The waves grow from the middle of the screen when it opens.
  intro: true,
  fps: 20,
  // Device pixels per CSS pixel the canvas is drawn at. 1 keeps it cheap on high density screens.
  dpr: 1,
  // How long the size must be still before the canvas is resized.
  resizeDebounceMs: 150,
}
