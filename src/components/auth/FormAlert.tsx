import { AlertCircle, CheckCircle2 } from "lucide-react"

type Props = {
  tone: "error" | "success"
  children: string
}

export function FormAlert({ tone, children }: Props) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "text-destructive flex items-start gap-2 text-sm"
          : "flex items-start gap-2 text-sm text-emerald-600 dark:text-emerald-500"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
