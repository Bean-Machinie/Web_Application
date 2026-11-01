import { createContext } from "react"

export type Background = "animated" | "still" | "off"

export type BackgroundState = {
  background: Background
  setBackground: (background: Background) => void
}

export const BackgroundContext = createContext<BackgroundState>({
  background: "animated",
  setBackground: () => {},
})
