import checkMark from "@/assets/icons/check-mark.svg"
import warning from "@/assets/icons/warning.svg"
import { Icon } from "@/components/Icon"

type Props = {
  tone: "error" | "success"
  children: string
}

export function FormAlert({ tone, children }: Props) {
  const icon = tone === "error" ? warning : checkMark

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "text-destructive flex items-start gap-2 text-sm"
          : "flex items-start gap-2 text-sm text-emerald-600 dark:text-emerald-500"
      }
    >
      <Icon src={icon} className="mt-0.5" />
      <span>{children}</span>
    </p>
  )
}
