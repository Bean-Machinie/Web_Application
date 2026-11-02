/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "@3d-dice/dice-box-threejs" {
  export default class DiceBox {
    constructor(selector: string, config?: Record<string, unknown>)
    initialize(): Promise<void>
    roll(notation: string): Promise<unknown>
    clearDice(): void
  }
}
