import { useContext } from "react"
import { CommandPaletteContext } from "./CommandPaletteContext"

export const useCommandPalette = () => useContext(CommandPaletteContext)
