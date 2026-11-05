export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40]

// System stacks, so nothing has to load. A null value is the page's own font.
export const FONT_FAMILIES = [
  { label: "Default", value: null },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  { label: "Handwritten", value: "'Segoe Script', 'Bradley Hand', 'Brush Script MT', cursive" },
]

// Mid tones that read on both the dark and the light theme.
export const TEXT_COLORS = [
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f59e0b" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  { label: "Grey", value: "#9ca3af" },
]

// Saturated and mostly solid, like a marker, but still a little see-through so the text
// reads over them on both themes.
export const HIGHLIGHTS = [
  { label: "Yellow", value: "rgba(255, 214, 0, 0.6)" },
  { label: "Green", value: "rgba(34, 214, 90, 0.55)" },
  { label: "Blue", value: "rgba(30, 144, 255, 0.55)" },
  { label: "Pink", value: "rgba(255, 64, 160, 0.55)" },
  { label: "Orange", value: "rgba(255, 140, 0, 0.6)" },
  { label: "Purple", value: "rgba(160, 80, 255, 0.55)" },
]
