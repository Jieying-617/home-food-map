# 3D Isometric Forest Visual Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a visually verified desktop and mobile mockup of the location page using a genuine 3D isometric forest diorama inspired by the design method of the approved Dribbble reference.

**Architecture:** Keep this phase isolated from production application code. Store the generated raster hero, standalone HTML mockup, contract test, and rendered screenshots under `docs/visuals/forest-isometric/`; the mockup uses live HTML for all product copy and a single generated raster asset for the 3D scene. After the user approves the rendered mockup, a separate plan will translate the direction into the Next.js application.

**Tech Stack:** Built-in OpenAI image generation, standalone HTML/CSS, Node.js static contract test, local Python HTTP server, in-app browser visual verification.

## Global Constraints

- Preserve the reference's dimensional isometric composition, sculpted forms, layered terrain, soft studio lighting, controlled color blocking, and generous editorial whitespace without copying Saudi-specific subject matter or exact composition.
- Forest palette: `#F4F1E8`, `#173F32`, `#748E58`, `#102E26`, `#B76535`, `#DDA45A`, `#A9A7D8`, `#16261F`, and `#66736C`.
- Hero title: `家里的森林储物图`; primary action: `添加位置`; secondary action: `查看今日巡柜路线`.
- Hero must be a raster 3D illustration, unframed, with no CSS-drawn house, inline SVG scene, or flat lollipop trees.
- UI copy stays live HTML; the generated image contains no text, labels, logos, or watermark.
- Cat is a small part of the scene and cannot become a sticker or mascot overlay.
- No negative letter spacing, decorative gradients, nested cards, or page-level horizontal overflow at 320px.
- This plan does not modify production routes, application logic, or `src/` files.

---

### Task 1: Generate And Select The 3D Forest Hero

**Files:**
- Create: `docs/visuals/forest-isometric/hero-v2.png`

**Interfaces:**
- Consumes: The approved design spec at `docs/superpowers/specs/2026-07-10-forest-isometric-location-map-design.md`.
- Produces: `hero-v2.png`, a landscape raster asset with no embedded text, consumed by Task 2 as `./hero-v2.png`.

- [ ] **Step 1: Generate the first hero candidate with the built-in image generation tool**

Use this exact art-direction prompt:

```text
Use case: stylized-concept
Asset type: website product UI hero illustration
Primary request: Create a premium 3D isometric miniature forest island for a household food-location map. The scene is an authored diorama, not an icon. Build an irregular moss-covered floating terrain slab with visible soil and rock thickness. A refined timber storage cottage anchors the composition, with substantial roof layers, deep eaves, recessed warm windows, a thick doorway, believable foundations, bevels, and visible architectural depth. A winding path connects five small recognizable household storage cues: a fridge, cabinet, shelf, drawer chest, and pantry box. Integrate one small cat naturally near the path or cottage.
Scene/backdrop: perfectly clean warm near-white studio background with abundant negative space, no frame and no card container
Style/medium: polished 3D isometric render, softly sculpted forms, refined low-poly-to-clay material language, subtle wood grain and moss texture, not flat vector, not watercolor, not a game icon
Composition/framing: landscape 3:2, isometric three-quarter camera, forest island concentrated in the right 62 percent, clear quiet negative space on the left 38 percent for live UI copy; cottage, cat, path, and all five storage cues fully visible
Lighting/mood: soft upper-left studio key light, ambient occlusion, contact shadows, controlled warm window glow, quiet premium editorial mood
Color palette: deep forest green #173F32, moss #748E58, shadow green #102E26, warm wood #B76535, golden light #DDA45A, tiny muted periwinkle #A9A7D8 accents, warm near-white background #F4F1E8
Materials/textures: visibly beveled wood, layered moss, matte stone, slightly rough painted metal on the fridge, soft but believable shadows
Constraints: no text, no letters, no numbers, no logo, no watermark, no border, no rounded rectangle behind the scene, no isolated icon composition, no flat trees, no giant cat, no people, no Saudi-specific architecture or symbols
Avoid: generic mobile-game art, glossy toy plastic, childish clip art, flat 2D vector shapes, lollipop trees, excessive mushrooms, crowded fantasy props, dark background, cinematic fog, photorealistic forest photography
```

Expected: one landscape scene whose forms remain legible when displayed around 640px wide.

- [ ] **Step 2: Inspect the generated image at original detail**

Use `view_image` and verify all of the following:

```text
PASS: terrain has visible thickness and irregular silhouette
PASS: cottage has real architectural depth and contact shadows
PASS: trees use layered volumes rather than flat silhouettes
PASS: five storage cues are recognizable but secondary
PASS: cat is visible only after a brief look
PASS: left-side negative space is clean enough for live copy
PASS: no embedded text, watermark, border, or card frame
```

Expected: all checks pass. If exactly one check fails, perform one edit/generation iteration changing only that failed property and repeat this inspection.

- [ ] **Step 3: Persist the selected asset in the project**

Copy the selected built-in output from `$CODEX_HOME/generated_images/` to:

```text
D:\Learning\home-food-map\docs\visuals\forest-isometric\hero-v2.png
```

Expected: `Get-Item` reports a non-zero PNG file and `view_image` shows the selected scene from the project path.

- [ ] **Step 4: Commit the hero asset**

```bash
git add docs/visuals/forest-isometric/hero-v2.png
git commit -m "design: add 3d forest hero artwork"
```

Expected: commit contains only `hero-v2.png`.

---

### Task 2: Build The Editorial Desktop And Mobile Mockup

**Files:**
- Create: `docs/visuals/forest-isometric/index.html`
- Create: `docs/visuals/forest-isometric/contract.test.mjs`

**Interfaces:**
- Consumes: `./hero-v2.png` from Task 1.
- Produces: A standalone responsive mockup at `/index.html` and a zero-dependency contract test executable with Node.js.

- [ ] **Step 1: Write the failing static contract test**

Create `docs/visuals/forest-isometric/contract.test.mjs` with:

```js
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("./index.html", import.meta.url), "utf8");

assert.match(html, /src="\.\/hero-v2\.png"/);
assert.match(html, /alt="3D 等距森林储物地图"/);
assert.match(html, /data-ud-check="hero-title"/);
assert.match(html, /data-ud-check="hero-illustration"/);
assert.match(html, /data-ud-check="inspection-route"/);
assert.match(html, /data-ud-check="location-directory"/);
assert.match(html, /家里的森林储物图/);
assert.match(html, /添加位置/);
assert.match(html, /查看今日巡柜路线/);
assert.match(html, /@media \(max-width: 768px\)/);
assert.doesNotMatch(html, /letter-spacing:\s*-/);
assert.doesNotMatch(html, /<svg/i);
assert.doesNotMatch(html, /\.house\b|\.cottage\b|\.forest-moon\b/);

console.log("forest-isometric contract: PASS");
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node docs/visuals/forest-isometric/contract.test.mjs
```

Expected: FAIL with `ENOENT` for `index.html`.

- [ ] **Step 3: Create the responsive mockup**

Create `docs/visuals/forest-isometric/index.html` as one semantic standalone page with this exact content structure:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>3D 等距森林储物地图视觉稿</title>
  <style>
    :root {
      --paper: #f4f1e8;
      --surface: #fffdf7;
      --forest: #173f32;
      --forest-shadow: #102e26;
      --moss: #748e58;
      --wood: #b76535;
      --gold: #dda45a;
      --periwinkle: #a9a7d8;
      --ink: #16261f;
      --muted: #66736c;
      --line: rgba(23, 63, 50, 0.18);
    }
    * { box-sizing: border-box; }
    html { background: var(--paper); color: var(--ink); font-family: Arial, "Microsoft YaHei", "PingFang SC", sans-serif; }
    body { margin: 0; background: var(--paper); }
    button { font: inherit; }
    .page { min-height: 100vh; overflow: hidden; }
    .topbar { width: min(1320px, calc(100% - 48px)); margin: 0 auto; min-height: 72px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
    .brand { color: var(--forest); font-size: 14px; font-weight: 900; }
    .date { color: var(--muted); font-size: 13px; }
    .hero { width: min(1320px, calc(100% - 48px)); margin: 0 auto; min-height: 650px; display: grid; grid-template-columns: minmax(360px, 0.72fr) minmax(560px, 1.28fr); align-items: center; position: relative; }
    .hero-copy { position: relative; z-index: 2; padding: 64px 0 72px; }
    .eyebrow { margin: 0 0 18px; color: var(--moss); font-size: 12px; font-weight: 900; text-transform: uppercase; }
    h1 { margin: 0; max-width: 560px; color: var(--forest-shadow); font-size: clamp(58px, 6vw, 92px); line-height: 0.98; font-weight: 950; letter-spacing: 0; }
    .lead { max-width: 520px; margin: 28px 0 0; color: var(--muted); font-size: 17px; line-height: 1.8; }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }
    .button { min-height: 48px; padding: 0 20px; border: 1px solid var(--line); border-radius: 6px; background: transparent; color: var(--forest); font-weight: 800; }
    .button.primary { border-color: var(--forest); background: var(--forest); color: white; }
    .summary { display: flex; gap: 32px; margin-top: 48px; }
    .metric { min-width: 92px; }
    .metric strong { display: block; color: var(--forest-shadow); font-size: 30px; }
    .metric span { color: var(--muted); font-size: 13px; }
    .hero-art { position: relative; min-width: 0; align-self: stretch; display: flex; align-items: center; justify-content: center; margin-right: -8vw; }
    .hero-art img { display: block; width: min(880px, 72vw); height: auto; object-fit: contain; filter: drop-shadow(0 28px 32px rgba(16, 46, 38, 0.12)); }
    .content-band { border-top: 1px solid var(--line); background: var(--surface); }
    .content-grid { width: min(1320px, calc(100% - 48px)); margin: 0 auto; display: grid; grid-template-columns: minmax(280px, 0.72fr) minmax(0, 1.28fr); }
    .route { padding: 56px 48px 64px 0; border-right: 1px solid var(--line); }
    .route h2, .directory h2 { margin: 0; color: var(--forest-shadow); font-size: 34px; line-height: 1.1; letter-spacing: 0; }
    .section-lead { margin: 14px 0 28px; color: var(--muted); line-height: 1.7; }
    .route-list { margin: 0; padding: 0; list-style: none; }
    .route-item { display: grid; grid-template-columns: 38px 1fr auto; gap: 14px; align-items: center; padding: 18px 0; border-top: 1px solid var(--line); }
    .route-index { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; background: var(--gold); color: var(--forest-shadow); font-weight: 900; }
    .route-name { font-weight: 900; }
    .route-meta, .route-risk { color: var(--muted); font-size: 12px; }
    .directory { padding: 56px 0 64px 48px; }
    .room-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--line); }
    .room { min-width: 0; padding: 24px 22px 28px 0; }
    .room + .room { padding-left: 22px; border-left: 1px solid var(--line); }
    .room h3 { margin: 0 0 8px; color: var(--forest); font-size: 22px; }
    .room p { min-height: 44px; margin: 0 0 22px; color: var(--muted); font-size: 13px; line-height: 1.6; }
    .location-row { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 14px; align-items: center; }
    .location-cube { width: 52px; aspect-ratio: 1; display: grid; place-items: center; border-radius: 6px; background: var(--periwinkle); color: var(--forest-shadow); font-size: 24px; }
    .location-row strong { display: block; overflow-wrap: anywhere; }
    .location-row span { color: var(--muted); font-size: 12px; }
    @media (max-width: 960px) {
      .hero { grid-template-columns: minmax(320px, 0.9fr) minmax(420px, 1.1fr); }
      .hero-art { margin-right: -18vw; }
      .content-grid { grid-template-columns: 1fr; }
      .route { padding-right: 0; border-right: 0; border-bottom: 1px solid var(--line); }
      .directory { padding-left: 0; }
    }
    @media (max-width: 768px) {
      .topbar, .hero, .content-grid { width: min(100% - 32px, 680px); }
      .topbar { min-height: 60px; }
      .hero { min-height: 0; grid-template-columns: 1fr; }
      .hero-copy { padding: 44px 0 18px; }
      h1 { max-width: 520px; font-size: clamp(50px, 15vw, 72px); }
      .lead { margin-top: 20px; font-size: 15px; }
      .summary { gap: 20px; margin-top: 32px; }
      .hero-art { margin: -22px -22vw 0 -8vw; min-height: 330px; justify-content: center; }
      .hero-art img { width: min(760px, 132vw); }
      .route, .directory { padding-top: 42px; padding-bottom: 48px; }
      .room-grid { grid-template-columns: 1fr; }
      .room { padding: 22px 0; }
      .room + .room { padding-left: 0; border-left: 0; border-top: 1px solid var(--line); }
    }
    @media (max-width: 420px) {
      .date { display: none; }
      h1 { font-size: 54px; }
      .hero-actions { display: grid; }
      .button { width: 100%; }
      .summary { justify-content: space-between; gap: 8px; }
      .metric { min-width: 0; }
      .metric strong { font-size: 26px; }
      .hero-art { min-height: 290px; }
      .route-item { grid-template-columns: 36px minmax(0, 1fr); }
      .route-risk { grid-column: 2; }
    }
  </style>
</head>
<body>
  <main class="page">
    <nav class="topbar" aria-label="视觉稿顶部栏">
      <div class="brand">HOME FOOD MAP</div>
      <div class="date">位置地图 · 2026.07.10</div>
    </nav>
    <section class="hero">
      <div class="hero-copy" data-ud-check="hero-title">
        <p class="eyebrow">家中储物地图 / Forest inventory</p>
        <h1>家里的森林储物图</h1>
        <p class="lead">当前有 5 个位置、19 件食物。沿着林间路线，先查看快到期的柜子，再整理安心库存。</p>
        <div class="hero-actions">
          <button class="button primary" type="button">添加位置</button>
          <button class="button" type="button">查看今日巡柜路线</button>
        </div>
        <div class="summary" aria-label="位置摘要">
          <div class="metric"><strong>5</strong><span>个储物位置</span></div>
          <div class="metric"><strong>19</strong><span>件食物在库</span></div>
          <div class="metric"><strong>2</strong><span>件本周优先</span></div>
        </div>
      </div>
      <div class="hero-art" data-ud-check="hero-illustration">
        <img src="./hero-v2.png" alt="3D 等距森林储物地图">
      </div>
    </section>
    <section class="content-band">
      <div class="content-grid">
        <aside class="route" data-ud-check="inspection-route">
          <h2>今天先巡这些位置</h2>
          <p class="section-lead">按到期风险排列，只走最需要处理的路线。</p>
          <ol class="route-list">
            <li class="route-item"><span class="route-index">1</span><div><div class="route-name">妈妈零食柜</div><div class="route-meta">客厅 · 蛋黄派 2026-07-28</div></div><span class="route-risk">30 天内</span></li>
            <li class="route-item"><span class="route-index">2</span><div><div class="route-name">厨房上层干货柜</div><div class="route-meta">厨房 · 意面 2026-09-20</div></div><span class="route-risk">很安心</span></li>
            <li class="route-item"><span class="route-index">3</span><div><div class="route-name">早茶抽屉</div><div class="route-meta">储物间 · 黑芝麻糊</div></div><span class="route-risk">很安心</span></li>
          </ol>
        </aside>
        <section class="directory" data-ud-check="location-directory">
          <h2>森林房间目录</h2>
          <p class="section-lead">真实位置结构保持不变，只将视觉语言换成森林微缩地图。</p>
          <div class="room-grid">
            <article class="room"><h3>客厅</h3><p>零食、茶几旁和随手拿的常温柜</p><div class="location-row"><div class="location-cube">▦</div><div><strong>妈妈零食柜</strong><span>14 件 · 30 天内</span></div></div></article>
            <article class="room"><h3>厨房</h3><p>干货、调料和做饭常用食材</p><div class="location-row"><div class="location-cube">▤</div><div><strong>上层干货柜</strong><span>2 件 · 很安心</span></div></div></article>
            <article class="room"><h3>冰箱区</h3><p>冷藏冷冻，优先查看近期到期</p><div class="location-row"><div class="location-cube">▥</div><div><strong>冰箱冷藏层</strong><span>0 件 · 空位置</span></div></div></article>
          </div>
        </section>
      </div>
    </section>
  </main>
</body>
</html>
```

- [ ] **Step 4: Run the contract test to verify it passes**

Run:

```bash
node docs/visuals/forest-isometric/contract.test.mjs
```

Expected output:

```text
forest-isometric contract: PASS
```

- [ ] **Step 5: Commit the mockup and test**

```bash
git add docs/visuals/forest-isometric/index.html docs/visuals/forest-isometric/contract.test.mjs
git commit -m "design: build isometric forest location mockup"
```

Expected: commit contains only the mockup HTML and contract test.

---

### Task 3: Render, Critique, Repair, And Present

**Files:**
- Modify: `docs/visuals/forest-isometric/index.html`
- Create: `docs/visuals/forest-isometric/desktop.png`
- Create: `docs/visuals/forest-isometric/mobile.png`

**Interfaces:**
- Consumes: The standalone mockup from Task 2.
- Produces: User-viewable localhost preview plus desktop and mobile evidence images.

- [ ] **Step 1: Start the local preview server**

Run from `D:\Learning\home-food-map\docs\visuals\forest-isometric`:

```bash
python -m http.server 4178 --bind 127.0.0.1
```

Expected: `http://127.0.0.1:4178/index.html` returns HTTP 200.

- [ ] **Step 2: Render and inspect desktop**

Open `http://127.0.0.1:4178/index.html` in the in-app browser at 1440x1000 and capture `desktop.png`.

Verify:

```text
The title is the first visual read.
The 3D island is unframed and crosses the editorial split naturally.
The cottage, cat, path, and storage cues are visible.
The next section is visible near the bottom of the first viewport.
No text overlaps the illustration.
document.documentElement.scrollWidth === document.documentElement.clientWidth
```

Expected: every check passes.

- [ ] **Step 3: Render and inspect mobile**

Render the same URL at 375x812 and capture `mobile.png`.

Verify:

```text
Title wraps without clipping.
Both actions remain at least 44px high.
Cottage, cat, path, and at least three storage cues remain visible.
The illustration does not become a tiny icon.
The first pixels of the inspection section are visible or reachable without a blank gap.
document.documentElement.scrollWidth === document.documentElement.clientWidth
```

Expected: every check passes.

- [ ] **Step 4: Repair any P0/P1 visual findings and rerun one affected viewport**

Only adjust these bounded properties in `index.html`: hero grid tracks, image width/margins, title size/line-height, section padding, and mobile crop. Do not alter the approved art direction or add decorative elements.

Expected: the affected viewport passes all checks after one targeted repair cycle.

- [ ] **Step 5: Re-run the static contract**

```bash
node docs/visuals/forest-isometric/contract.test.mjs
```

Expected output:

```text
forest-isometric contract: PASS
```

- [ ] **Step 6: Commit rendered evidence and any repair**

```bash
git add docs/visuals/forest-isometric/index.html docs/visuals/forest-isometric/desktop.png docs/visuals/forest-isometric/mobile.png
git commit -m "design: verify forest mockup across viewports"
```

Expected: final commit contains screenshots and only the HTML changes required by visual repair.

- [ ] **Step 7: Present the result**

Keep the browser visible on `http://127.0.0.1:4178/index.html` and provide both screenshots inline. State that this is a visual direction mockup and that production app changes have not yet been made.

## Self Review

- Spec coverage: The plan covers raster 3D art, reference translation, unframed hero composition, strong typography, live UI copy, responsive behavior, cat integration, and rendered desktop/mobile evidence.
- Placeholder scan: No TBD, TODO, "implement later", or undefined code steps remain.
- Type consistency: Task 1 produces `hero-v2.png`; Task 2 consumes that exact path; Task 2 produces `index.html`; Task 3 serves and renders that exact file.
- Scope integrity: The plan creates a visual mockup only and does not touch production application code.
