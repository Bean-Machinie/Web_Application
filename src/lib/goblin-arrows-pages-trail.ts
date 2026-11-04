// Page text in the markup of template-markup.ts.

export const AMBUSH = `
:::read-aloud
Half a day along the Triboar Trail, the road bends between steep banks thick with brambles. Fifty feet ahead, two horses lie across the path. Black-feathered arrows stand out of their sides like quills.
:::

:::read-aloud If they search the horses
The saddlebags have been cut open and emptied. In the dirt beside them lies a leather map case, open and empty.
:::

:::gm
The horses belonged to @{gundren} and @{sildar} and died about a day ago. The empty case held @{gundren-map}.
:::

## Creatures

- 4 × @{goblin}, two hidden on each side of the road.

## Running it

- Roll one Stealth check for all the goblins (+6). Characters whose passive Perception is lower are surprised.
- Two goblins charge into melee. Two stay back about 30 feet and shoot.
- When three goblins are down, the last one runs for the @{goblin-trail}.

## Developments

- A goblin knocked out instead of killed can be questioned when it wakes. See "What the goblins know".
- A captured goblin can lead the party down the trail and around the traps.
- If the party loses, the goblins loot them and the wagon and leave them unconscious.
`

export const TRAIL = `
:::gm
Behind the thickets north of the road, a DC 10 Survival check shows about a dozen goblins have used this trail, and two human-sized bodies were dragged along it. The trail runs five miles northwest to @{hideout}. The wagon can be pulled off the road and the oxen tied.
:::

Ask for marching order again. The traps hit the character in front.

## Snare

- Spot: automatic with passive Perception 12+ if searching, otherwise DC 12 Perception.
- Trigger: DC 10 Dexterity save or be hoisted upside down 10 feet up, restrained.
- Escape: cut the cord (1 slashing damage). Falling without help: 1d6 bludgeoning.

## Pit

- Spot: automatic with passive Perception 15+, otherwise DC 15 Perception.
- Trigger: DC 10 Dexterity save or fall 10 feet, 1d6 bludgeoning.
- The sides are shallow; climbing out needs no check.

:::gm
Award 75 XP each when the party reaches the cave mouth.
:::
`
