import { Eye, Flame, Heart, Shield, Sparkles, Star, Swords } from "lucide-react"

// The icon of a feature, from the words of its name; the first group that matches wins.
const ICONS = [
  { words: /rage|breath|fire|flame/i, icon: Flame },
  { words: /defense|armor|resilience|resistance|unarmored/i, icon: Shield },
  { words: /mastery|attack|style|archery|fighting|savage|weapon/i, icon: Swords },
  { words: /wind|healing|hands|toughness|endurance|relentless/i, icon: Heart },
  { words: /dark|sense|vision|alert|perception/i, icon: Eye },
  { words: /skill|expertise|versatile|resourceful|cant|luck|nimble|stealth|origin/i, icon: Star },
]

export const featureIcon = (...names: (string | null)[]) => ICONS.find(({ words }) => words.test(names.filter(Boolean).join(" ")))?.icon ?? Sparkles
