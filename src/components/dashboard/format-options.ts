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

// See-through, so the text stays readable over them.
export const HIGHLIGHTS = [
  { label: "Yellow", value: "rgba(250, 204, 21, 0.35)" },
  { label: "Green", value: "rgba(74, 222, 128, 0.3)" },
  { label: "Blue", value: "rgba(96, 165, 250, 0.32)" },
  { label: "Pink", value: "rgba(244, 114, 182, 0.32)" },
  { label: "Orange", value: "rgba(251, 146, 60, 0.35)" },
  { label: "Purple", value: "rgba(192, 132, 252, 0.32)" },
]
