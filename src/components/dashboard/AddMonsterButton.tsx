import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Monster } from "@/lib/compendium-monsters"
import { AddMonsterDialog } from "./AddMonsterDialog"

// Opens the dialog that puts the monster into a campaign as a Creature or an NPC.
export function AddMonsterButton({ monster }: { monster: Monster }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Add to campaign</Button>
      <AddMonsterDialog monster={monster} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
