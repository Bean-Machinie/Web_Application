import type { ReactNode } from "react"

type Props = { label: string; name: string; children: ReactNode }

// One source of the character (its class, background or species) straight on the panel: a small
// uppercase label over the name, and its rows. A full-width line, 20px clear on both sides,
// separates it from the one above. Used by the tabs of the character panel.
export function QuickSection({ label, name, children }: Props) {
  return (
    <section aria-label={`${label}: ${name}`} className="flex flex-col gap-3.5 not-first:-mr-2 not-first:-ml-4 not-first:mt-5 not-first:border-t not-first:pt-5 not-first:pr-2 not-first:pl-4">
      <div className="flex flex-col gap-0.5">
        <p className="text-muted-foreground text-[11px] leading-none tracking-widest uppercase">{label}</p>
        <h3 className="text-foreground text-sm font-medium">{name}</h3>
      </div>
      <ul className="flex flex-col gap-3.5">{children}</ul>
    </section>
  )
}
