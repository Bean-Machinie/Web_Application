type Props = {
  value: string
  disabled: boolean
  onChange: (value: string) => void
}

// The campaign's name as a big line of text that is edited in place: no visible box.
export function CampaignTitle({ value, disabled, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <input
        autoFocus
        aria-label="Campaign name"
        maxLength={60}
        value={value}
        disabled={disabled}
        placeholder="Untitled campaign"
        onChange={(event) => onChange(event.target.value)}
        className="placeholder:text-muted-foreground/60 w-full bg-transparent text-3xl font-semibold tracking-tight outline-none"
      />
      <p className="text-muted-foreground text-sm">
        You&apos;ll be the GM and can invite players afterwards.
      </p>
    </div>
  )
}
