import { Textarea } from "@/components/ui/textarea"

export const ABOUT_MAX = 160

type Props = { value: string; onChange: (value: string) => void; disabled: boolean }

export function AboutField({ value, onChange, disabled }: Props) {
  return (
    <>
      <Textarea
        aria-label="Description"
        maxLength={ABOUT_MAX}
        rows={3}
        className="min-h-24 resize-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <p className="text-muted-foreground mt-2 text-right text-xs tabular-nums">
        {value.length} / {ABOUT_MAX}
      </p>
    </>
  )
}
