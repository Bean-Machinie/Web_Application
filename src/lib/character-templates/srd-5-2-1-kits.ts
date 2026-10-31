import type { Kit, KitItem } from "./srd-5-2-1-choices"

// Starting equipment: each class’s Core Traits table (the class’s first page) and each
// background’s entry (p. 83). Every one is a choice between a kit and gold. Item names are
// the SRD’s; a weapon or armor also names its row in srd-5-2-1-gear.ts.

const i = (name: string, rest: Partial<KitItem> = {}): KitItem => ({ name, ...rest })
const weapon = (id: string, name: string, qty?: number): KitItem => i(name, { weapon: id, qty })
const armor = (id: string, name: string): KitItem => i(name, { armor: id })
const gold = (id: string, gp: number): Kit => ({ id, label: "Gold", gp, items: [] })

const PACK = {
  dungeoneer: i("Dungeoneer’s Pack"),
  explorer: i("Explorer’s Pack"),
  entertainer: i("Entertainer’s Pack"),
  priest: i("Priest’s Pack"),
  burglar: i("Burglar’s Pack"),
  scholar: i("Scholar’s Pack"),
}
const ARROWS = [i("20 Arrows"), i("Quiver")]

// p. 28 to p. 77, Starting Equipment of each class.
export const CLASS_KITS: Record<string, Kit[]> = {
  barbarian: [
    { id: "barbarian-a", label: "A", gp: 15, items: [weapon("greataxe", "Greataxe"), weapon("handaxe", "Handaxe", 4), PACK.explorer] },
    gold("barbarian-b", 75),
  ],
  bard: [
    { id: "bard-a", label: "A", gp: 19, items: [armor("leather", "Leather Armor"), weapon("dagger", "Dagger", 2), i("Musical Instrument", { chosenTool: "class-tools" }), PACK.entertainer] },
    gold("bard-b", 90),
  ],
  cleric: [
    { id: "cleric-a", label: "A", gp: 7, items: [armor("chain-shirt", "Chain Shirt"), i("Shield", { shield: true }), weapon("mace", "Mace"), i("Holy Symbol"), PACK.priest] },
    gold("cleric-b", 110),
  ],
  druid: [
    { id: "druid-a", label: "A", gp: 9, items: [armor("leather", "Leather Armor"), i("Shield", { shield: true }), weapon("sickle", "Sickle"), weapon("quarterstaff", "Druidic Focus (Quarterstaff)"), PACK.explorer, i("Herbalism Kit")] },
    gold("druid-b", 50),
  ],
  fighter: [
    { id: "fighter-a", label: "A", gp: 4, items: [armor("chain-mail", "Chain Mail"), weapon("greatsword", "Greatsword"), weapon("flail", "Flail"), weapon("javelin", "Javelin", 8), PACK.dungeoneer] },
    { id: "fighter-b", label: "B", gp: 11, items: [armor("studded-leather", "Studded Leather Armor"), weapon("scimitar", "Scimitar"), weapon("shortsword", "Shortsword"), weapon("longbow", "Longbow"), ...ARROWS, PACK.dungeoneer] },
    gold("fighter-c", 155),
  ],
  monk: [
    { id: "monk-a", label: "A", gp: 11, items: [weapon("spear", "Spear"), weapon("dagger", "Dagger", 5), i("Tool or instrument", { chosenTool: "class-tools" }), PACK.explorer] },
    gold("monk-b", 50),
  ],
  paladin: [
    { id: "paladin-a", label: "A", gp: 9, items: [armor("chain-mail", "Chain Mail"), i("Shield", { shield: true }), weapon("longsword", "Longsword"), weapon("javelin", "Javelin", 6), i("Holy Symbol"), PACK.priest] },
    gold("paladin-b", 150),
  ],
  ranger: [
    { id: "ranger-a", label: "A", gp: 7, items: [armor("studded-leather", "Studded Leather Armor"), weapon("scimitar", "Scimitar"), weapon("shortsword", "Shortsword"), weapon("longbow", "Longbow"), ...ARROWS, i("Druidic Focus (sprig of mistletoe)"), PACK.explorer] },
    gold("ranger-b", 150),
  ],
  rogue: [
    { id: "rogue-a", label: "A", gp: 8, items: [armor("leather", "Leather Armor"), weapon("dagger", "Dagger", 2), weapon("shortsword", "Shortsword"), weapon("shortbow", "Shortbow"), ...ARROWS, i("Thieves’ Tools"), PACK.burglar] },
    gold("rogue-b", 100),
  ],
  sorcerer: [
    { id: "sorcerer-a", label: "A", gp: 28, items: [weapon("spear", "Spear"), weapon("dagger", "Dagger", 2), i("Arcane Focus (crystal)"), PACK.dungeoneer] },
    gold("sorcerer-b", 50),
  ],
  warlock: [
    { id: "warlock-a", label: "A", gp: 15, items: [armor("leather", "Leather Armor"), weapon("sickle", "Sickle"), weapon("dagger", "Dagger", 2), i("Arcane Focus (orb)"), i("Book (occult lore)"), PACK.scholar] },
    gold("warlock-b", 100),
  ],
  wizard: [
    { id: "wizard-a", label: "A", gp: 5, items: [weapon("dagger", "Dagger", 2), weapon("quarterstaff", "Arcane Focus (Quarterstaff)"), i("Robe"), i("Spellbook"), PACK.scholar] },
    gold("wizard-b", 55),
  ],
}

// p. 83 (Background Descriptions, Equipment).
export const BACKGROUND_KITS: Record<string, Kit[]> = {
  acolyte: [
    { id: "acolyte-a", label: "A", gp: 8, items: [i("Calligrapher’s Supplies"), i("Book (prayers)"), i("Holy Symbol"), i("Parchment (10 sheets)"), i("Robe")] },
    gold("acolyte-b", 50),
  ],
  criminal: [
    { id: "criminal-a", label: "A", gp: 16, items: [weapon("dagger", "Dagger", 2), i("Thieves’ Tools"), i("Crowbar"), i("Pouch", { qty: 2 }), i("Traveler’s Clothes")] },
    gold("criminal-b", 50),
  ],
  sage: [
    { id: "sage-a", label: "A", gp: 8, items: [weapon("quarterstaff", "Quarterstaff"), i("Calligrapher’s Supplies"), i("Book (history)"), i("Parchment (8 sheets)"), i("Robe")] },
    gold("sage-b", 50),
  ],
  soldier: [
    { id: "soldier-a", label: "A", gp: 14, items: [weapon("spear", "Spear"), weapon("shortbow", "Shortbow"), ...ARROWS, i("Gaming Set", { chosenTool: "background-tool" }), i("Healer’s Kit"), i("Traveler’s Clothes")] },
    gold("soldier-b", 50),
  ],
}

// The kit with this id, whichever class or background it belongs to; null for none.
export const kitById = (id: string | null | undefined) =>
  [...Object.values(CLASS_KITS), ...Object.values(BACKGROUND_KITS)].flat().find((kit) => kit.id === id) ?? null
