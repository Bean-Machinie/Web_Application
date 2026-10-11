import * as React from "react"
import { cn } from "cn"
import { Slider as SliderPrimitive } from "radix-ui"

// A turn of the wheel moves the slider this share of its range, and never less than a step.
const WHEEL_SHARE = 1 / 40
// A trackpad sends many small turns; they count once they add up to this much.
const WHEEL_LEAST = 40

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  onValueCommit,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  // The wheel moves a slider whose value is given: up raises it, Shift moves it a step.
  // Listened to by hand, as a wheel listener of React's cannot stop the panel scrolling.
  const root = React.useRef<HTMLSpanElement>(null)
  const latest = React.useRef({ value, min, max, step, onValueChange, onValueCommit, disabled: props.disabled })
  React.useEffect(() => {
    latest.current = { value, min, max, step, onValueChange, onValueCommit, disabled: props.disabled }
  })
  React.useEffect(() => {
    const node = root.current
    if (!node) return
    let turned = 0
    const onWheel = (event: WheelEvent) => {
      const { value, min, max, step, onValueChange, onValueCommit, disabled } = latest.current
      if (disabled || !Array.isArray(value) || value.length !== 1 || event.deltaY === 0) return
      event.preventDefault()
      turned += event.deltaY
      if (Math.abs(turned) < WHEEL_LEAST) return
      const steps = event.shiftKey ? 1 : Math.max(1, Math.round((max - min) / step * WHEEL_SHARE))
      const next = value[0] - Math.sign(turned) * steps * step
      turned = 0
      const snapped = Math.min(Math.max(Number((min + Math.round((next - min) / step) * step).toFixed(6)), min), max)
      if (snapped === value[0]) return
      onValueChange?.([snapped])
      onValueCommit?.([snapped])
    }
    node.addEventListener("wheel", onWheel, { passive: false })
    return () => node.removeEventListener("wheel", onWheel)
  }, [])

  return (
    <SliderPrimitive.Root
      ref={root}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      className={cn(
        "relative -my-2 flex w-full touch-none items-center py-2 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-muted data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-foreground/10 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden active:ring-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
