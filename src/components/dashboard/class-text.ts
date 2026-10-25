import type { ClassBuild } from "@/lib/character-templates/srd-5-2-1-classes"

const MARTIAL = {
  all: "Martial weapons",
  light: "Martial weapons that have the Light property",
  "finesse-light": "Martial weapons that have the Finesse or Light property",
}

export const weaponsText = ({ weapons }: ClassBuild) =>
  weapons.martial ? `${weapons.simple ? "Simple and " : ""}${MARTIAL[weapons.martial]}` : "Simple weapons"
