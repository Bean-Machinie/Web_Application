import { createContext } from "react"

export const CommandPaletteContext = createContext<{ open: () => void }>({ open: () => {} })
