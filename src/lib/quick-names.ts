// Names to suggest for each species. Our own lists, not the SRD’s, which has none.
export const NAMES: Record<string, string[]> = {
  dragonborn: ["Kriv", "Medrash", "Nadarr", "Rhogar", "Biri", "Daar", "Harann", "Kava", "Sora", "Thava", "Torinn", "Ghesh"],
  dwarf: ["Thorin", "Brunhild", "Dain", "Gimra", "Harbek", "Kathra", "Orsik", "Rurik", "Thazra", "Vistra", "Baern", "Helja"],
  elf: ["Aelar", "Caelith", "Faelyn", "Ilyana", "Lorien", "Naivara", "Sylvar", "Thalan", "Elara", "Erevan", "Quelenna", "Varis"],
  gnome: ["Bimpnottin", "Dimble", "Fonkin", "Nissa", "Orryn", "Pip", "Roondar", "Zook", "Breena", "Tana", "Wrenn", "Gerbo"],
  goliath: ["Aukan", "Eglath", "Gae-Al", "Keothi", "Lo-Kag", "Manneo", "Nalla", "Orilo", "Thotham", "Vimak", "Maveith", "Uthal"],
  halfling: ["Merric", "Pippa", "Corrin", "Lidda", "Osborn", "Rosie", "Wellby", "Andry", "Seraphina", "Garret", "Verna", "Finnan"],
  human: ["Alden", "Brielle", "Cassian", "Dara", "Edric", "Freya", "Garrick", "Helena", "Joren", "Mira", "Tobias", "Wynne"],
  orc: ["Dench", "Feng", "Gell", "Holg", "Imsh", "Krusk", "Mhurren", "Shump", "Baggi", "Ovak", "Yevelda", "Ronk"],
  tiefling: ["Akmenos", "Damakos", "Kallista", "Mordai", "Nemeia", "Orianna", "Rieta", "Skamos", "Zaria", "Amnon", "Makaria", "Pelaios"],
}

// Four different names for a species, in a random order.
export function suggestNames(species: string, count = 4) {
  return [...(NAMES[species] ?? [])].sort(() => Math.random() - 0.5).slice(0, count)
}
