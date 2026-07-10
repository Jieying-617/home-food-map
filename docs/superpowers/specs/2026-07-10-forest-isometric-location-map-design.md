# 3D Isometric Forest Location Map Design

## Decision

Selected direction: **3D isometric forest diorama with editorial product UI**.

The visual direction borrows the design method of Nermin Muminovic's "Saudi Arabia" Dribbble shot without copying its subject matter. Preserve the dimensional isometric composition, sculpted forms, layered terrain, soft studio lighting, controlled color blocking, and generous editorial whitespace. Replace the Saudi city and desert language with a domestic forest world built around storage locations.

## Request Anchor

- Original goal: Refactor the `home-food-map` location page into a fairy-tale forest direction with deep green, large areas of whitespace, forest cottages, and strong title typography.
- Latest user override: Match the shape language and design sense of `https://dribbble.com/shots/27538208-Saudi-Arabia`, but replace the theme with a forest.
- Confirmed choice: Central forest island with surrounding functional annotations.
- Deliverable next: A desktop and mobile visual mockup before production UI implementation.
- Primary audience: Family members scanning household food locations quickly, especially on mobile.
- Core job: Understand which location to inspect first and recognize the home's storage structure at a glance.
- Success criteria: The hero reads as a polished 3D illustration, not a CSS icon; the forest world feels authored and dimensional; the title and primary action remain immediately legible; storage data still outranks decoration below the hero.
- Non-goals: Do not copy the Saudi artwork, add game mechanics, alter inventory logic, or turn the whole product into an ornamental storybook.
- Must preserve: Existing routes, location data, risk states, action meanings, and mobile-first usability.

## Reference Translation

Preserve from the reference:

- Isometric three-quarter camera and compact miniature-world composition.
- Rounded but substantial 3D masses with visible depth and beveling.
- Soft directional light, ambient occlusion, contact shadows, and restrained material variation.
- Large quiet background areas around one memorable illustration.
- Strong, simple editorial typography rather than decorative fantasy lettering.
- A limited palette with one or two deliberate contrast colors.

Replace for the forest version:

- Desert terrain becomes an irregular moss-covered forest island.
- Monumental Saudi architecture becomes a refined timber storage cottage.
- Palm/city elements become layered fir trees, broadleaf shrubs, stones, mushrooms, and a winding path.
- Cultural landmark details become household storage cues: fridge, cabinet, shelf, drawer, and pantry box.
- Human-scale street activity becomes a subtle cat character integrated into the diorama.

Do not preserve:

- Saudi-specific architecture, symbols, costumes, or exact composition.
- The source palette as a literal copy.
- Any recognizable model, object arrangement, or proprietary asset.

## Visual System

Core read: **premium 3D forest diorama + calm editorial household tool**.

Color roles:

- Page background: warm near-white, `#F4F1E8`.
- Primary forest: `#173F32`.
- Moss: `#748E58`.
- Deep shadow green: `#102E26`.
- Warm wood: `#B76535`.
- Golden light: `#DDA45A`.
- Cool contrast accent: muted periwinkle, `#A9A7D8`.
- Main text: `#16261F`.
- Muted text: `#66736C`.
- Risk coral remains semantic and is not reused as decoration.

Materials and lighting:

- Use a refined 3D-rendered material language, between soft clay and lightly textured wood.
- Surfaces need bevels, thickness, subtle roughness, and believable contact shadows.
- Trees must have layered volumes rather than flat lollipop silhouettes.
- The cottage must have architectural depth: eaves, window recesses, door thickness, roof layers, and grounded foundations.
- Use soft upper-left studio light with controlled warm window glow.
- Keep the scene clean enough to read at mobile size; avoid photorealistic noise.

## Hero Composition

- Desktop uses an asymmetrical editorial split: strong title and status copy occupy the left 38-42%; the forest diorama occupies the right 58-62% and may visually cross the center line.
- The diorama is unframed on the page. It must not sit inside a rounded white card.
- The island uses an irregular organic silhouette with visible soil/rock thickness beneath the moss layer.
- The main cottage anchors the upper middle of the island. A path links five recognizable storage nodes.
- One cat appears as a small narrative detail near the cottage or path. It must feel part of the world, not a sticker.
- Empty space around the island is intentional and carries no decorative gradients or floating blobs.

## Typography And Content

- Use strong modern Chinese display typography with dense weight, neutral geometry, and zero negative letter spacing.
- Hero title remains `家里的森林储物图` or a shorter approved equivalent if mobile wrapping requires it.
- Use a compact eyebrow such as `HOME FOOD MAP / 家中储物地图`.
- Supporting copy reports real counts and the next inspection action.
- One primary action is visually dominant: `添加位置`.
- Secondary action: `查看今日巡柜路线`.
- Do not use fantasy-script fonts, faux handwritten labels, or decorative explanatory copy.

## Product UI Below The Hero

- The inspection route becomes an editorial numbered list with strong hierarchy, not a dark card stack.
- Room groups use full-width bands or a clean grid with restrained separators.
- Location entries use a small crop or miniature render from the same 3D visual world, plus explicit text labels, counts, and risk state.
- Avoid nested cards, large pill collections, and repeated white rounded rectangles.
- Keep status badges only where they encode inventory or expiry meaning.

## Responsive Behavior

- At 768px and below, title and actions appear first; the 3D island follows as a wide image with a stable aspect ratio.
- At 375px, the island remains large enough to show cottage depth, path, and at least three storage cues.
- Decorative edge details may crop on mobile, but the cottage, cat, and main storage nodes cannot be cut off.
- The hero must leave a hint of the next content section visible on common mobile heights.
- No page-level horizontal overflow at 320px.

## Asset Strategy

- The hero is a generated raster illustration, not CSS, inline SVG, or a collection of icon shapes.
- Generate a landscape master with clear negative space and enough resolution for desktop retina use.
- Build the visual mockup around the raster asset; do not fabricate a low-fidelity substitute when evaluating the direction.
- Production location thumbnails may later use coordinated crops or separately generated assets, but the first mockup only needs the hero master and existing location icons.
- No text is rendered inside the generated illustration; all UI text remains live HTML.

## Interaction And Motion

- First mockup is static. Visual quality is the acceptance criterion.
- Future motion, if approved, may use very subtle parallax, cat movement, or warm window breathing; it must support reduced motion.
- Do not use continuous floating animation or game-like bouncing controls.

## Quality Gates

- The cottage reads as a dimensional scene with material depth at first glance.
- No visible CSS-drawn house, flat icon forest, or generic vector-lollipop trees remain in the hero.
- The layout retains large whitespace and strong title hierarchy at 1440px, 768px, 375px, and 320px.
- The hero image is not placed in a rounded card and does not compete with the primary action.
- The forest palette is deep and varied, not monochrome green.
- The cat is discoverable but does not dominate the scene.
- All storage meaning remains available in live text; the illustration is not the only carrier of state.
- The final visual mockup receives rendered desktop and mobile inspection before presentation.

## Self Review

- Placeholder scan: No TBD or TODO markers.
- Internal consistency: The direction is consistently 3D isometric, not watercolor, flat vector, or CSS illustration.
- Scope check: The next deliverable is one visual mockup, not a full production refactor.
- Ambiguity check: "Similar" means design method and dimensional language, not copying Saudi subject matter or exact composition.
- Request integrity: Forest theme, deep green, generous whitespace, cottage, strong title, and the referenced 3D design sense are all explicitly represented.
