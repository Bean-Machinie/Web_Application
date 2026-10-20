// The look TiltCard cards share. Only transform and opacity animate: the
// lighter fill, border and top highlight live on ::before and the deeper
// shadow on ::after, and each fades in. Slower out (250ms) than in (150ms)
// leaves a soft trail when sweeping across cards.
const LAYER =
  "relative isolate before:pointer-events-none after:pointer-events-none before:absolute after:absolute before:-inset-px after:-inset-px before:-z-10 after:-z-10 before:rounded-[inherit] after:rounded-[inherit] before:opacity-0 after:opacity-0 before:transition-opacity after:transition-opacity before:duration-250 after:duration-250 before:ease-out after:ease-out hover:before:duration-150 hover:after:duration-150 before:content-[''] after:content-['']"
const FILL =
  "before:bg-foreground/[0.03] before:shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent)] after:shadow-[0_12px_28px_-8px_rgb(0_0_0/0.35)]"
// A card with its menu open stops showing hover; the menu has the focus.
const FADE_IN =
  "hover:before:opacity-100 hover:after:opacity-100 has-[:focus-visible]:before:opacity-100 has-[:focus-visible]:after:opacity-100 has-[[data-state=open]]:before:opacity-0! has-[[data-state=open]]:after:opacity-0!"

// The overlay border sits on top of the card's own, so it matches the
// card's border style and colour.
const BORDER = {
  default: "before:border before:border-foreground/20",
  selected: "before:border before:border-primary",
  dashed: "before:border before:border-dashed before:border-foreground/40",
}

export const tiltCardSkin = (variant: keyof typeof BORDER = "default") =>
  `${LAYER} ${FILL} ${BORDER[variant]} ${FADE_IN}`
