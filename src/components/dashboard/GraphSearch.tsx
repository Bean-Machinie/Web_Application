import { Search } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ClearSearchButton } from "./ClearSearchButton"

type Props = {
  value: string
  onChange: (value: string) => void
  // Enter: take the best match.
  onSubmit: () => void
}

// Finds entries in the graph: the hits light up and the rest dim, and the camera
// goes to the best one.
export function GraphSearch({ value, onChange, onSubmit }: Props) {
  return (
    <InputGroup className="bg-card/90 backdrop-blur-sm">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSubmit()
          else if (event.key === "Escape" && value) {
            event.stopPropagation()
            onChange("")
          }
        }}
        placeholder="Find in graph"
        aria-label="Find in graph"
      />
      <ClearSearchButton value={value} onClear={() => onChange("")} />
    </InputGroup>
  )
}
