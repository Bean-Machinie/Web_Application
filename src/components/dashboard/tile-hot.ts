import { createContext, useContext } from "react"

// Whether the Home tile something sits in is pointed at or holds the keyboard focus.
export const TileHotContext = createContext(false)

export const useTileHot = () => useContext(TileHotContext)
