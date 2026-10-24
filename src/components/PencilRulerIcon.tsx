import { PencilRuler } from "lucide-react"
import { forwardRef } from "react"
import type { IconHandle, IconProps } from "./AnimatedIcon"

// AnimateIcons has no pencil-ruler, so this is Lucide's, standing in the same slot as an
// animated icon. The handle does nothing: it does not move.
export const PencilRulerIcon = forwardRef<IconHandle, IconProps>(({ size, className }, _ref) => (
  <span className={className}>
    <PencilRuler size={size} />
  </span>
))

PencilRulerIcon.displayName = "PencilRulerIcon"
