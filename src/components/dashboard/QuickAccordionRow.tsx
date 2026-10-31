import type { ReactNode } from "react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { QuickSwap } from "./QuickSwap"

type Props = {
  // Names the item inside its Accordion.
  value: string
  name: string
  // What it comes to, under the name; it wraps. `effect` follows it, muted.
  text: string
  effect?: string | null
  changed: boolean
  className?: string
  // What shows when the row is open.
  children: ReactNode
}

// A row of a property list, as an item of the Accordion: the name over what it comes to, and the
// chevron at the right. Put it in an `<Accordion type="single" collapsible>`.
export function QuickAccordionRow({ value, name, text, effect, changed, className, children }: Props) {
  return (
    <AccordionItem value={value} className={className}>
      <AccordionTrigger className="items-center py-2.5 hover:no-underline">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-foreground flex text-[13px] font-medium"><QuickSwap text={name} className="px-0" /></span>
          <span className="text-muted-foreground flex text-xs">
            <span className="min-w-0">
              <QuickSwap text={text} changed={changed} wrap className="px-0" />
              {effect && <span> · {effect}</span>}
            </span>
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col items-start gap-2 pb-3">{children}</AccordionContent>
    </AccordionItem>
  )
}
