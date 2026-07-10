# 3D Isometric Forest Location Map Design

## Decision

Selected direction: **interactive 3D storybook forest diorama with editorial product UI**.

The visual direction borrows the design method of Nermin Muminovic's "Saudi Arabia" Dribbble shot without copying its subject matter. Preserve the dimensional isometric composition, sculpted forms, layered terrain, soft studio lighting, controlled color blocking, and generous editorial whitespace. Replace the Saudi city and desert language with a domestic forest world built around storage locations.

## Request Anchor

- Original goal: Refactor the `home-food-map` location page into a fairy-tale forest direction with deep green, large areas of whitespace, forest cottages, and strong title typography.
- Latest user override: Match the shape language and design sense of `https://dribbble.com/shots/27538208-Saudi-Arabia`, but replace the theme with a forest.
- Responsive composition override: On desktop the island moves toward the visual center; on phones the complete island and cottage must remain visible with breathing room instead of using an oversized crop.
- Confirmed choice: Central forest island with surrounding functional annotations.
- Latest visual choice: `立体绘本森林`, with vivid flowers and mushrooms, natural wood and moss material cues, one orange cat, and one black-and-white cat.
- Latest interaction choice: Replace the raster hero with a real transparent WebGL model that supports rotation and zoom.
- Delivery status: The approved desktop and mobile direction is now implemented on the production locations route.
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

- Page background: warm near-white, `#F8EEE2`, sampled from the raster edge so the hero remains visually unframed.
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
- Build the canopy in three readable depth bands: tall cool-green pines at the back, staggered medium trees at the cottage edges, and low broadleaf crowns plus flowering shrubs at the island rim.
- Tree heights, crown widths, rotations, and trunk exposure must vary; avoid a single evenly spaced row or mirrored planting pattern.
- Key cottage, pine, broadleaf, and flowering-bush silhouettes use compact CC0 GLB assets, while project-bound textures and lighting keep the scene visually authored.
- The cottage must have architectural depth: eaves, window recesses, door thickness, roof layers, and grounded foundations.
- Cottage reference override: use a low single-storey cedar forest cabin with a charcoal gable roof, broad glass entrance, warm wall sconces, raised front porch, rails, and three grounded steps; do not use a tall medieval half-timber house.
- Trees are arranged as three asymmetric clusters with visible gaps between them. Tree trunks must clear cabinet exclusion zones and remain within the moss island's safe ground radius.
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
- Mobile scales the complete island to the art region; the cottage, cat, storage nodes, island edge, and right-side breathing room cannot be cut off.
- The hero must leave a hint of the next content section visible on common mobile heights.
- No page-level horizontal overflow at 320px.

## Asset Strategy

- The hero is a generated raster illustration, not CSS, inline SVG, or a collection of icon shapes.
- Generate a landscape master with clear negative space and enough resolution for desktop retina use.
- Build the visual mockup around the raster asset; do not fabricate a low-fidelity substitute when evaluating the direction.
- Production location thumbnails may later use coordinated crops or separately generated assets, but the first mockup only needs the hero master and existing location icons.
- Production delivery serves the master through `next/image` responsive source sets; location fallback crops request thumbnail-sized variants instead of decoding the full desktop raster.
- No text is rendered inside the generated illustration; all UI text remains live HTML.

## Interaction And Motion

- The hero is a real Three.js scene rendered on a transparent canvas, not a raster image plane.
- Users can rotate horizontally through 360 degrees and zoom with wheel or pinch; vertical orbit and distance are constrained so the model cannot become lost.
- Panning is disabled. A reset-view control restores the authored isometric camera.
- Contact shadow is rendered inside the transparent scene and moves with the model; no rectangular image background or baked shadow remains.
- Do not use continuous auto-rotation, floating animation, or game-like bouncing controls.
- Reduced-motion mode disables inertial damping while preserving direct manipulation.

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
- Scope check: Production work remains limited to the locations route, its owned components, and its scoped styles.
- Ambiguity check: "Similar" means design method and dimensional language, not copying Saudi subject matter or exact composition.
- Request integrity: Forest theme, deep green, generous whitespace, cottage, strong title, and the referenced 3D design sense are all explicitly represented.

## Rendered Verification Record

- Design read: a memorable 3D forest world introduces a practical household inventory tool; the illustration carries emotion while live text carries status and action.
- Anti-default locks: no flat forest icons, nested cards, gradients, decorative pills, or generic centered hero composition.
- Visual memory feature: the right-weighted isometric cottage island paired with oversized dark-green Chinese display type.
- Desktop at 1440x1000: title remains the first read, the full island is visible without a rectangular PNG boundary, the content band begins at 722px, and page-level horizontal overflow is absent.
- Mobile at 375x812: the illustration uses a 270px crop window with right-anchored art, both actions remain 48px high, the content band begins at 805.8px, and page-level horizontal overflow is absent.
- Desktop composition policy: remove the right-pulling negative margin and translate the art left within its grid track so the island sits closer to the page center.
- Mobile composition policy: use a `108vw` image capped by the art region, right-aligned with a small inward offset; preserve the complete cottage, path, cat, storage nodes, and island silhouette.
- Responsive repair verification: at 375x812 the rendered image is approximately 405x270 inside the 328x270 art window with the island fully visible; at 320x812 it is approximately 346x231 with no page-level horizontal overflow.

## Production Route Status

- Applied to the production route `/f/[familyId]/locations` on 2026-07-10.
- The route continues to load live data through `listLocations` and derives counts and inspection priority through `buildLocationOverview`.
- Existing add-location, location-detail, empty-state, and bottom-navigation routes remain unchanged.
- The production composition uses the approved warm near-white field, 38/62 unframed forest hero, full-width editorial inspection band, and editorial location rows with raster forest fallback crops.
- Dynamic counts, inspection links, location cards, expiry dates, and risk text remain live HTML; the illustration does not carry product state by itself.
- Production browser verification: at 375x812 the metrics end exactly where the 270px art region begins and the content band starts at 702px above the 731px navigation; at 320x812 the content band starts at 725px with no horizontal overflow.
- Interactive 3D verification: transparent canvases render at 760x620 on 1440x900 and 328x270 on 375x812; pixel standard deviation confirms nonblank output, drag changes the rendered view, wheel zoom changes the frame, and the DOM reset control restores the authored camera.
- The procedural storybook scene contains a moss island, timber cottage, storage furniture, layered pines and shrubs, flowers, coral mushrooms, an orange cat, a black-and-white cat, golden window light, and transparent contact shadow.
