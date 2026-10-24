export type GameNotice = {
  // The character template this covers, and the anchor on the legal page.
  id: string
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
    name: "D&D 5e",
    source: "SRD 5.1",
    uses: "The structure of the character sheet: ability scores, skills, saving throws and hit points.",
    notice:
      'This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.',
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

export const noticeFor = (templateId: string) => GAME_NOTICES.find((notice) => notice.id === templateId) ?? null

export const noticePath = (templateId: string) => `/app/legal#${templateId}`

export const LEGAL_UPDATED = "24 October 2026"
