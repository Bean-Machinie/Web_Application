import { HoverIcon } from "@/components/icons/HoverIcon"
import { EyeIcon } from "@/components/icons/EyeIcon"
import { EyeOffIcon } from "@/components/icons/EyeOffIcon"
import { useState } from "react"
import { Input } from "@/components/ui/input"

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  disabled: boolean
  autoComplete: "current-password" | "new-password"
}

export function PasswordField({ label, value, onChange, disabled, autoComplete }: Props) {
  const [shown, setShown] = useState(false)

  return (
    <div className="relative">
      <Input
        aria-label={label}
        type={shown ? "text" : "password"}
        autoComplete={autoComplete}
        className="pr-9"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <button
        type="button"
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        onClick={() => setShown((now) => !now)}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 outline-none focus-visible:ring-2"
      >
        {shown ? <HoverIcon icon={EyeOffIcon} size={16} /> : <HoverIcon icon={EyeIcon} size={16} />}
      </button>
    </div>
  )
}
