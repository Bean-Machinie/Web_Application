export type GameNotice = {
  // The anchor on the legal page, and the character template this covers (its own id, for
  // a notice that is for every version) at one version.
  id: string
  template?: string
  version?: number
  name: string
  // The name and version of the source, as shown beside the template name on a sheet.
  source: string
  uses: string
  notice: string
}

// Structure only, in the terms of each licence: no rules text, class features or spells.
export const GAME_NOTICES: GameNotice[] = [
  {
    id: "dnd-5e",
    version: 1,
    name: "D&D 5e",
    source: "SRD 5.1",
    uses: "The structure of the character sheet: ability scores, skills, saving throws and hit points.",
    notice:
      'This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.',
  },
  {
    id: "dnd-5e-2024",
    template: "dnd-5e",
    version: 2,
    name: "D&D 5e (2024 rules)",
    source: "SRD 5.2.1",
    uses: "The structure of the character sheet and its numbers: classes, species, backgrounds, ability scores, skills, saving throws and hit points.",
    // As on the SRD 5.2.1's own legal page (p. 1). The PDF breaks the last link across two
    // lines, which would otherwise read as two words.
    notice:
      "This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.",
  },
  {
    id: "blades-in-the-dark",
    name: "Blades in the Dark",
    source: "SRD",
    uses: "The structure of the character sheet: action ratings, stress and harm.",
    notice:
      "This work is based on Blades in the Dark (found at http://www.bladesinthedark.com/), product of One Seven Design, developed and authored by John Harper, and licensed for our use under the Creative Commons Attribution 3.0 Unported license (http://creativecommons.org/licenses/by/3.0/).",
  },
]

export const noticeFor = (templateId: string, version: number) =>
  GAME_NOTICES.find((notice) => (notice.template ?? notice.id) === templateId && (notice.version ?? version) === version) ?? null

export const noticePath = (templateId: string) => `/app/legal#${templateId}`

export const LEGAL_UPDATED = "24 October 2026"
