import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ClearSearchButton } from "./ClearSearchButton"

type Props = { value: string; onChange: (value: string) => void; label: string }

// A search that is a single icon until it is wanted, then a field. It stays a field
// while there is text in it, so a search that is on is never hidden.
export function ExpandingSearch({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false)

  if (!open && value === "") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label={label} onClick={() => setOpen(true)}>
            <Search />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <InputGroup className="animate-in fade-in-0 slide-in-from-right-2 w-44 duration-150 sm:w-56">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => {
          // Moving to the x of the same field is not leaving it.
          const field = event.currentTarget.closest("[data-slot=input-group]")
          if (!field?.contains(event.relatedTarget)) setOpen(false)
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return
          event.stopPropagation()
          if (value) onChange("")
          else setOpen(false)
        }}
        placeholder={label}
        aria-label={label}
      />
      <ClearSearchButton value={value} onClear={() => onChange("")} />
    </InputGroup>
  )
}
