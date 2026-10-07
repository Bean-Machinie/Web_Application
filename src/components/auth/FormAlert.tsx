import checkMark from "@/assets/icons/check-mark.svg"
import warning from "@/assets/icons/warning.svg"
import { Icon } from "@/components/Icon"

type Props = {
  tone: "error" | "warning" | "success"
  children: string
}

const TONES = {
  error: "text-destructive",
  warning: "text-amber-600 dark:text-amber-500",
  success: "text-emerald-600 dark:text-emerald-500",
}

export function FormAlert({ tone, children }: Props) {
  const icon = tone === "success" ? checkMark : warning

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 text-sm ${TONES[tone]}`}
    >
      <Icon src={icon} className="mt-0.5" />
      <span>{children}</span>
    </p>
  )
}
