/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "@3d-dice/dice-box-threejs" {
  export interface DiceMesh {
    visible: boolean
    scale: { setScalar(value: number): void }
    rotation: { set(x: number, y: number, z: number): void; order: string }
    geometry: { computeBoundingSphere(): void; boundingSphere: { radius: number } | null }
  }

  export interface DiceCamera {
    fov: number
    aspect: number
    position: { set(x: number, y: number, z: number): void }
    lookAt(x: number, y: number, z: number): void
    updateProjectionMatrix(): void
  }

  export interface DiceRenderer {
    domElement: HTMLCanvasElement
    autoClear: boolean
    setPixelRatio(ratio: number): void
    setSize(width: number, height: number): void
    setClearColor(color: number, alpha: number): void
    setViewport(x: number, y: number, width: number, height: number): void
    setScissor(x: number, y: number, width: number, height: number): void
    setScissorTest(enabled: boolean): void
    clear(): void
    render(scene: unknown, camera: DiceCamera): void
    dispose(): void
  }

  export default class DiceBox {
    constructor(selector: string, config?: Record<string, unknown>)
    colorData: unknown
    desk: { visible: boolean }
    light: { position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void }; distance: number; decay: number; intensity: number }
    light_amb: { intensity: number }
    scene: { add(object: DiceMesh): void; remove(object: DiceMesh): void }
    DiceColors: { makeColorSet(colorset: object): Promise<unknown> }
    camera: DiceCamera
    renderer: DiceRenderer
    DiceFactory: {
      material_options: { shininess: number; specular: number }
      applyColorSet(colorset: unknown): void
      create(type: string): DiceMesh | null
    }
    initialize(): Promise<void>
    roll(notation: string): Promise<unknown>
    add(notation: string): Promise<unknown>
    clearDice(): void
    updateConfig(config: Record<string, unknown>): Promise<void>
  }
}
