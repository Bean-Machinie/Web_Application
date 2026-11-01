import { forwardRef } from "react"
import type { Variants } from "motion/react"
import { m } from "motion/react"
import { AnimatedIcon } from "@/components/AnimatedIcon"
import type { IconHandle, IconProps } from "@/components/AnimatedIcon"

const body: Variants = {
  normal: { y: 0, rotate: 0 },
  animate: { y: [0, -1.2, 0], rotate: [0, -3, 3, 0], transition: { duration: 0.6, ease: "easeInOut" } },
}

const eye: Variants = {
  normal: { scaleY: 1 },
  animate: { scaleY: [1, 0.1, 1], transition: { duration: 0.35, delay: 0.15, ease: "easeInOut" } },
}

const EYE_STYLE = { transformBox: "fill-box", transformOrigin: "center" } as const

// Discord's mark, drawn as an outline like the rest of the animated icons. Its eyes blink
// and it bobs when played.
export const DiscordIcon = forwardRef<IconHandle, IconProps>((props, ref) => (
  <AnimatedIcon ref={ref} {...props}>
    <m.g variants={body} style={EYE_STYLE}>
      <path d="M8.4 18.4C6.6 17.9 5.4 17.3 4.3 16.5C3.7 12.5 4.6 8.6 6.2 6.2C7.4 5.5 8.6 5.1 10 4.8L10.6 6.1C11.5 5.95 12.5 5.95 13.4 6.1L14 4.8C15.4 5.1 16.6 5.5 17.8 6.2C19.4 8.6 20.3 12.5 19.7 16.5C18.6 17.3 17.4 17.9 15.6 18.4L14.9 17.2C13.7 17.5 10.3 17.5 9.1 17.2Z" />
      <m.circle cx="9" cy="12" r="1" variants={eye} style={EYE_STYLE} />
      <m.circle cx="15" cy="12" r="1" variants={eye} style={EYE_STYLE} />
    </m.g>
  </AnimatedIcon>
))

DiscordIcon.displayName = "DiscordIcon"
