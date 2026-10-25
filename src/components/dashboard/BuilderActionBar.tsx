import { Button } from "@/components/ui/button"

type Props = {
  index: number
  total: number
  nextLabel?: string
  onBack?: () => void
  onNext: () => void
}

// Always at the bottom of the builder: Back, where you are, and the way on.
export function BuilderActionBar({ index, total, nextLabel, onBack, onNext }: Props) {
  return (
    <footer className="bg-background h-16 shrink-0 border-t">
      <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-3 items-center px-8">
        <Button variant="ghost" className="justify-self-start" disabled={!onBack} onClick={onBack}>Back</Button>
        <span className="text-muted-foreground justify-self-center text-sm">Step {index + 1} of {total}</span>
        <Button className="justify-self-end" onClick={onNext}>{nextLabel ? `Continue to ${nextLabel}` : "Finish and open sheet"}</Button>
      </div>
    </footer>
  )
}
