# Map assets

The art that can be placed on maps in the map builder. Everything here shows up
in the builder's asset panel by itself: there is no list to edit.

## Adding art

1. Put an image in a folder named after its category:
   `src/assets/map-assets/<category>/<file>`
2. Reload the builder. That's it.

- **A new folder is a new category.** `bridges/` becomes a "Bridges" tab. Only
  one level of folders is read.
- **File names become display names.** `stone-bridge.png` is shown as
  "Stone bridge" (dashes and underscores become spaces, the extension goes).
- **Formats:** SVG, PNG, WebP or JPG, with a transparent background. SVGs need
  `width` and `height` attributes, which set the shape they are drawn at.
  Painted art is best exported as **WebP at about 1024 px** on the longest side:
  it is far smaller than PNG, and 1024 px is enough to stay sharp when the map is
  published. Anything above about 1500 px only costs memory.

## Two kinds of art

The builder looks at the colour of each picture when it loads and treats it as
one of two kinds. You do not choose: it is decided by how much of the picture is
coloured.

### Ink art (monochrome)

Black lines, greys, pure white and transparent. The map adds the colour.

- **Lines** are drawn in the map's ink colour. The darker a pixel, the stronger the
  ink; greys are lighter ink. Where the ground has a biome painted on it, the
  ink takes on that biome's ink (dark orange on desert, dark green in swamp),
  changing along the art as the ground does. How far it follows the ground is set
  per category in `src/lib/map-assets.ts` (`INK_FOLLOWS`): nature fully,
  buildings only a little.
- **Pure white (`#fff`)** marks where the shape is solid. The ground shows through
  it, and the art hides whatever is behind it with ground, not with white.
- **Transparent** outside the shape: nothing is drawn, and clicks go through.
- **A consistent line weight.** The coast is drawn at 2.5 px (`LINE_WEIGHT` in
  `src/lib/map-theme.ts`). Art should match it at the size it is first placed, so
  a line should be `2.5 × (the art's width ÷ the category's default width)` pixels
  wide, in the SVG's own units. Light comes from the top left.

### Painted art (colour)

Anything that is clearly coloured is drawn as you painted it, over what is
behind it. Nothing shows through it. It gets, automatically:

- **Careful shrinking.** The picture is shrunk in steps to the size it is drawn
  at, then sharpened a little, and given a little more contrast the further it
  was shrunk, so brush texture stays readable.
- **The map's colour grade**, one look over all painted art so it sits in the map.
- **A soft contact shadow** at its foot, cast to the lower right.

All of these are set in `src/lib/map-theme.ts`, under `paint` (`grade`,
`sharpen`, `smallContrast`, `shadow`), per background.

## Painted art that changes with the biome

Some painted art changes colour with the biome it stands on, so a forest looks
right on desert, in swamp and on ice. This is **opt-in per category**, in
`RECOLOURS` in `src/lib/map-assets.ts`. At the moment **`oak-trees`**, **`pine-trees`**,
**`mountains`**, **`hills`**, **`nature`**, **`volcanos`**, **`desert-trees`**,
**`towns`**, **`buildings`**, **`camp`**, **`floating`** and **`desert`** change. Everything else is drawn as painted. Ink art never changes. A folder's name is its category, with
spaces and dashes counting the same (`desert trees` and `desert-trees` are one).

**What changes.** By default the greens and yellow-greens of a painting change,
with a soft edge on the range of colour. Browns and greys, such as trunks, stay,
and so does anything very dark or hardly coloured. Each category has its own
range of colour, because what counts as "grass" is different on a tree and on a
mountain slope.

**How it changes.** The painting's own lights and darks are kept and mapped onto
a set of colours for the biome, so the brushwork and volume survive. The range is
taken from the changing parts only, so a pale trunk or dark outline does not make
foliage too bright or dark. The colour sets are in `src/lib/map-theme.ts`
(`paint.recolour`), one set for each category that needs its own. Foliage becomes
frosty blue-green with white highlights on ice, dry olive on desert, murky dark
green in swamp and charred grey on volcanic ground. Plains keeps the painting's
own colours.

**Which biome.** Each piece looks at the paint at its foot and blends between
the biomes there, so a forest fades gradually across a border, tree by tree.

### Mountains: grass, snow and rock

A mountain has three kinds of surface, and each biome treats them differently:

- **Grass**, the olive and green on the lower slopes, is picked as above.
- **Snow** is the very bright, hardly saturated cream and white, and the pale
  blue of snow in shade. It is found by colour.
- **Rock** is everything that is neither grass nor snow: ochre, brown and the
  deep blue shadows.

| Biome      | Grass  | Snow                     | Rock                    |
| ---------- | ------ | ------------------------ | ----------------------- |
| Plains     | as painted | as painted           | as painted              |
| Ice        | snowy  | stays                    | cool slate              |
| Desert     | sandy  | pale sandstone, no white | warm red-orange         |
| Swamp      | murky  | pale grey-green          | dark mossy grey-green   |
| Volcanic   | ash    | pale ash, no white       | black basalt, charcoal  |

So there are no snow caps on desert, swamp or volcanic ground, and the rock takes
the colours of the ground. For colours to look right, snow should be clearly
brighter than the rock around it, and the grass should be olive or green rather
than brown.

### Desert trees: leaves and trunk

Desert trees have golden leaves and an orange trunk, which would stand out on any
other ground, so both change. The leaves are picked by their golden colour and
take the ground's foliage colours; the trunk is everything else and takes bark of
the ground (cool grey-brown on ice, dark brown in swamp, charred black on
volcanic ground). The desert look is also what the trees look like on plains, and
on desert ground itself: it is the tree's resting look, set by `base` in
`RECOLOURS`, so the painting as exported is only the start of it. The pale
highlights on the trunk are told apart from the leaves by being less saturated,
so keep the trunk's lights paler than the leaves.

### Oak and pine trees

Oak and pine trees change in every biome as described above. On plains they are also taken
out of the painting's bright green: the leaves become a calm olive and the orange
trunk a muted bark, so the trees sit in the ground (`base: "plains"` in
`RECOLOURS`). On the other biomes the trunk keeps its painted colour.
Pines are given a darker, richer colour than oaks, as in life, in every biome
(`PINES` and `OAKS` in `src/lib/map-theme.ts`); on ice, swamp and volcanic ground
the difference is only slight.

### Hills

Hills are golden meadow with orange-brown ridges and teal shadows. The sunlit
meadow is picked as the grass, and the shaded sides and ridges are the rock, and
both change. Their colours on ice, swamp and volcanic ground are the same as the
mountains', so hills and mountains match on every ground; on desert they are
sandy dunes. Their resting look, on plains, is a green meadow (`base: "plains"`
in `RECOLOURS`), so the painting's golden colours are only the start of it.

### Volcanoes

Volcanoes have green and golden slopes around a dark cone. The slopes are the
grass; the cone, its cooled rust-coloured lava and its tan ash are the rock. Both
take the ground's colours, with the rock kept darker so the cone still reads on
every ground: frosted slopes and slate cone on ice, sand and dark brown on
desert, murky green and mossy black in swamp, ash and basalt on volcanic ground.
**Lava, its white-hot glow and smoke never change** (`keep` in `RECOLOURS`):
they are found by being bright orange-red, near white-hot, or pale and hardly
coloured. Plains keeps the painting as it is.

### Nature (grass tufts)

Grass tufts in `nature/` change as a whole, to a narrow range around the ground's
colour, so they sit in it. They cast no shadow and are placed small (90 px).

In flowers (`flowers.png`) the same range picks the olive stems and leaves, which
blend into the ground; the petals are too vivid to be picked and keep their
painted colours on every ground.

### Towns and towers

Only the living green changes: the ground around the buildings, bushes, trees
and ivy. They take the ground's colour, with the bushes darker than it. Stone,
roofs, wood, flags and rocks keep their painted colours on every ground, since
they are ochre and orange, below the green hue range in `RECOLOURS`. The
painting's yellow-olive moss is only the start of the look: plains has its own
calmer meadow green (`base: "plains"` in `RECOLOURS`).

### Camp, floating and desert

`camp/` and `floating/` are treated like towns: only the living green changes.
The floating city's blue-grey cliffs stay as painted.

`desert/` (ruins, bones, cacti, desert cities) has a mask next to each piece
(`Abandoned wagon.mask.png`) that marks the ground in it: the sand, the scrub on it
and the rocks in it. White is the ground, black stays as painted. Inside the mask
the three are told apart by colour and each changes on its own:

| Part                          | Desert and plains           | Other biomes               |
| ----------------------------- | --------------------------- | -------------------------- |
| Sunlit sand (bright yellow)   | toned to the ground         | the ground's colours       |
| Scrub (green)                 | as painted                  | the ground's foliage       |
| Rocks and shaded sand (rest)  | as painted                  | the ground's rock colours  |

Cloth, wood, bones and sandstone outside the mask never change. A piece with no
mask does not change at all.

### Choosing the grass with a mask

To say exactly which parts are grass (or, for foliage, may change), put a mask
next to the art with the same name and `.mask.png` (or `.mask.webp`):

```
mountains/mountain 2.png
mountains/mountain 2.mask.png
```

White means the part is grass, black means it is not, and greys count by that
much. The mask can be any resolution, but it must have the **same proportions**
as the art, because it is stretched to fit it. A mask is not art: it does not
appear in the library. With a mask, the automatic grass pick is not used at all.
On mountains, snow is still found by colour and rock is what is left, so a mask
only has to mark the grass. An all-black mask means there is no grass.

## How big art is when first placed

Each category has a default width on the canvas, in canvas pixels (the canvas
is 3072 to 3840 px wide). They are set in `src/lib/map-assets.ts`, in
`DEFAULT_WIDTH`:

| Category    | Default width |
| ----------- | ------------- |
| `mountains` | 220 px        |
| `oak-trees`, `pine-trees` | 180 px |
| `desert-trees` | 180 px     |
| `towns`     | 170 px        |

A category that is not listed there, such as a new folder, gets the fallback
width, `FALLBACK_WIDTH` (160 px). Add a line to `DEFAULT_WIDTH` to give a
category its own.

## Do not rename or move files that maps already use

A map stores each piece of art by its path under this folder
(for example `pine-trees/pine 1.png`). Renaming or moving a file would leave maps
that use it with a dashed placeholder box where the art was. Changing what a
file looks like is fine, and so is adding a mask.

## Drawing order

You never order art by hand. Art is drawn in order of its bottom edge: what is
lower on the map is in front.
