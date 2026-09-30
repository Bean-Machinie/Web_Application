import type { ReactNode } from "react"

type Props = {
  title: string
  description: string
  children: ReactNode
}

export function CampaignFormPage({ title, description, children }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 pt-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {children}
    </section>
  )
}
