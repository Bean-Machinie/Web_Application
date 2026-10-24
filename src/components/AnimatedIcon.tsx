import { cn } from "@/lib/utils"
import { LazyMotion, domMin, m, useAnimation, useReducedMotion } from "motion/react"
import { forwardRef, useImperativeHandle } from "react"
import type { ForwardRefExoticComponent, HTMLAttributes, ReactNode, RefAttributes } from "react"

// How the app's animated icons are made, so that they are all alike:
//  - one 24-unit drawing, a 2-unit round stroke, `currentColor`, no fill;
//  - the drawing fills the same live area, 3 to 21 across (18 units), so two icons of the
//    same size are the same size to look at, whatever they are of;
//  - one default size for every icon button (ICON_SIZE), never chosen per icon;
//  - two states, "normal" and "animate", defined by the icon on the shapes it draws;
//  - played from outside through the handle: the button plays it on hover, and the page on
//    whatever the icon is about (a menu opening, something new arriving);
//  - not played at all when the person asks for less motion.
export const ICON_SIZE = 20

export interface IconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

export type IconProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "color" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
> & { size?: number }

// Any icon that can be played through the handle.
export type AnimatedIconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<IconHandle>>

// The shell every icon draws into. Its children are the shapes, with variants.
export const AnimatedIcon = forwardRef<IconHandle, IconProps & { children: ReactNode }>(
  ({ size = ICON_SIZE, className, children, ...props }, ref) => {
    const controls = useAnimation()
    const reduced = useReducedMotion()

    useImperativeHandle(
      ref,
      () => ({
        startAnimation: () => {
          if (!reduced) controls.start("animate")
        },
        stopAnimation: () => {
          controls.start("normal")
        },
      }),
      [controls, reduced]
    )

    return (
      <LazyMotion features={domMin} strict>
        <m.div className={cn("inline-flex items-center justify-center", className)} {...props}>
          <m.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={controls}
            initial="normal"
            // Inline, because a button forces the svgs inside it to 1rem with a class, which
            // beats the width and height attributes.
            style={{ overflow: "visible", width: size, height: size }}
          >
            {children}
          </m.svg>
        </m.div>
      </LazyMotion>
    )
  }
)

AnimatedIcon.displayName = "AnimatedIcon"
