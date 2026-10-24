import * as React from "react"
import { cn } from "cn"
import { ToggleGroup } from "radix-ui"

type Option<T extends string> = {
  value: T
  label: string
  icon?: React.ReactNode
  // Wraps the option, as a tooltip does: it is given the option to put its trigger on.
  wrap?: (option: React.ReactElement) => React.ReactElement
}

type Props<T extends string> = {
  value: T
  onValueChange: (value: T) => void
  options: Option<T>[]
  "aria-label": string
  className?: string
  disabled?: boolean
}

// A segmented control: a few options side by side, one of them always chosen. The chosen
// one is a filled thumb that slides to the next when the choice changes (an Alt-tap
// elsewhere included), so it is always plain which is on and which way it went. The
// options are all of one width, so the thumb needs no measuring. The chosen option is styled
// by aria-checked, not data-state, which a tooltip around an option takes for its own. It is a Radix toggle group,
// so the arrow keys move the choice and a screen reader hears a radio group. Two to five
// options with short labels; the thumb does not slide for someone who asks for less motion.
function SegmentedControl<T extends string>({ value, onValueChange, options, className, disabled, ...props }: Props<T>) {
  const index = Math.max(
    options.findIndex((option) => option.value === value),
    0
  )

  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      // Pressing the chosen option again would clear a toggle group: here it stays chosen.
      onValueChange={(next) => next && onValueChange(next as T)}
      aria-label={props["aria-label"]}
      disabled={disabled}
      data-slot="segmented-control"
      style={{ "--count": options.length, "--index": index } as React.CSSProperties}
      // Sunk into the surface: darker than what is around it, with its top edge in shadow and a faint lip of light along the bottom.
      className={cn("bg-muted dark:bg-black/30 relative grid grid-flow-col auto-cols-fr rounded-lg p-0.5 shadow-[inset_0_1px_3px_rgb(0_0_0/0.25),0_1px_0_rgb(255_255_255/0.5)] dark:shadow-[inset_0_2px_5px_rgb(0_0_0/0.6),0_1px_0_rgb(255_255_255/0.06)] data-[disabled]:opacity-50", className)}
    >
      <span
        aria-hidden
        style={{ width: "calc((100% - 0.25rem) / var(--count))", transform: "translateX(calc(var(--index) * 100%))" }}
        className="bg-primary pointer-events-none absolute inset-y-0.5 left-0.5 rounded-md shadow-[0_1px_2px_rgb(0_0_0/0.35),0_3px_6px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.35)] transition-transform duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
      />
      {options.map((option) => {
        const item = (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring aria-checked:text-primary-foreground aria-checked:hover:text-primary-foreground relative z-10 flex h-7 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium outline-none transition-colors duration-200 focus-visible:ring-2 [&_svg]:size-3.5 [&_svg]:shrink-0"
          >
            {option.icon}
            {option.label}
          </ToggleGroup.Item>
        )
        return option.wrap ? React.cloneElement(option.wrap(item), { key: option.value }) : item
      })}
    </ToggleGroup.Root>
  )
}

export { SegmentedControl }
