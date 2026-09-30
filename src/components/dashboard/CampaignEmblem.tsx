import {
  Anchor,
  Axe,
  Bird,
  Castle,
  Compass,
  Crown,
  Feather,
  Flame,
  Gem,
  Hourglass,
  Key,
  Mountain,
  Moon,
  Scroll,
  Shield,
  Ship,
  Skull,
  Sparkles,
  Sun,
  Swords,
  Telescope,
  Tent,
  Trees,
  WandSparkles,
  Waves,
} from "lucide-react"

const GLYPHS = [
  Castle, Crown, Swords, Compass, Mountain, Flame, Moon, Sun, Anchor, Gem,
  Feather, Trees, Waves, WandSparkles, Scroll, Shield, Key, Skull, Tent,
  Sparkles, Ship, Bird, Hourglass, Axe, Telescope,
]

// Spread around the colour wheel, so neighbours in a list rarely match.
const HUES = [25, 55, 95, 150, 185, 225, 265, 300, 335]

// FNV-1a: a small, stable hash, so a name always gives the same emblem.
function hash(text: string) {
  let value = 2166136261
  for (const char of text) {
    value = Math.imul(value ^ char.codePointAt(0)!, 16777619)
  }
  return value >>> 0
}

// The picture a campaign has until an image is uploaded: a symbol on a
// coloured circle, chosen from its name so it is the same everywhere. It
// fills whatever circle it is put in and scales with it.
export function CampaignEmblem({ name }: { name: string }) {
  const key = name.trim().toLowerCase()

  if (!key) {
    return (
      <div className="bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full">
        <Compass className="size-1/2" strokeWidth={1.75} />
      </div>
    )
  }

  const seed = hash(key)
  const Glyph = GLYPHS[seed % GLYPHS.length]
  const hue = HUES[(seed >>> 8) % HUES.length]

  return (
    <div
      className="flex size-full items-center justify-center rounded-full"
      style={{
        background: `linear-gradient(135deg, oklch(0.62 0.13 ${hue}), oklch(0.42 0.1 ${hue + 25}))`,
      }}
    >
      {/* A hovered menu row recolours the text of everything inside it, and
          the icon's inner paths follow that. Fixing the stroke, rather than
          relying on the text colour, keeps the symbol white. */}
      <Glyph className="size-1/2 stroke-white!" strokeWidth={1.75} />
    </div>
  )
}
