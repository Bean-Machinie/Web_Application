import type { ReactNode } from "react"

type Props = {
  title: string
  description: string
  children: ReactNode
}

export function SettingsSection({ title, description, children }: Props) {
  return (
    <section className="grid gap-4 py-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
      </div>
      <div className="max-w-xl">{children}</div>
    </section>
  )
}
