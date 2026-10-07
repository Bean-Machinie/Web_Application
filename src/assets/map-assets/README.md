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
`RECOLOURS` in `src/lib/map-assets.ts`. At the moment only **`forests`** change.
Buildings, mountains and everything else are drawn as painted. Ink art never
changes.

**What changes.** By default the greens and yellow-greens of a painting change,
with a soft edge on the range of colour. Browns and greys, such as trunks, stay,
and so does anything very dark or hardly coloured.

**How it changes.** The painting's own lights and darks are kept and mapped onto
a set of colours for the biome, so the brushwork and volume survive. The range is
taken from the changing parts only, so a pale trunk or dark outline does not make
foliage too bright or dark. The colour sets are in `src/lib/map-theme.ts`
(`paint.recolour`): frosty blue-green with white highlights for ice, dry olive for
desert, murky dark green for swamp, charred grey for volcanic. Plains keeps the
painting's own colours.

**Which biome.** Each piece looks at the paint at its foot and blends between
the biomes there, so a forest fades gradually across a border, tree by tree.

### Choosing what changes with a mask

To say exactly which parts may change, put a mask next to the art with the same
name and `.mask.png` (or `.mask.webp`):

```
forests/tree.png
forests/tree.mask.png
```

White means the part may change, black means it may not, and greys change by
that much. The mask can be any resolution, but it must have the **same
proportions** as the art, because it is stretched to fit it. A mask is not art:
it does not appear in the library. With a mask, the automatic colour pick is not
used at all. An all-black mask turns recolouring off for that file.

## How big art is when first placed

Each category has a default width on the canvas, in canvas pixels (the canvas
is 3072 to 3840 px wide). They are set in `src/lib/map-assets.ts`, in
`DEFAULT_WIDTH`:

| Category    | Default width |
| ----------- | ------------- |
| `mountains` | 220 px        |
| `forests`   | 180 px        |
| `towns`     | 170 px        |

A category that is not listed there, such as a new folder, gets the fallback
width, `FALLBACK_WIDTH` (160 px). Add a line to `DEFAULT_WIDTH` to give a
category its own.

## Do not rename or move files that maps already use

A map stores each piece of art by its path under this folder
(for example `forests/tree.png`). Renaming or moving a file would leave maps
that use it with a dashed placeholder box where the art was. Changing what a
file looks like is fine, and so is adding a mask.

## Drawing order

You never order art by hand. Art is drawn in order of its bottom edge: what is
lower on the map is in front.
