# Forest Location Production Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the real family locations page with the approved 3D isometric forest direction while preserving live data, location navigation, add-location behavior, bottom navigation, and existing location-detail flows.

**Architecture:** Keep database access in the existing server page, derive overview metrics and inspection priority through a pure domain helper, and render the new visual system through scoped location components. The generated hero becomes a production public asset; all product copy and state remain live HTML. Other application pages and theme tuning remain unchanged.

**Tech Stack:** Next.js 16 App Router, React 19 server components, TypeScript, Tailwind CSS 4 plus scoped global CSS, Vitest/Testing Library, Playwright.

## Global Constraints

- Preserve `listLocations(familyId)`, `/f/[familyId]/locations/new`, `/f/[familyId]/locations/[locationId]`, and `BottomNav` behavior.
- Use the approved raster scene as `/images/location-forest-hero.png`; do not recreate the cottage with CSS, SVG, or flat icons.
- Dynamic counts and route items must come from live location and food data.
- Primary action is `添加位置`; secondary action scrolls/navigates to `今日巡柜路线` without inventing a new backend flow.
- Missing location covers use a real crop of the approved forest illustration, not an icon tile or `ImageOff` placeholder.
- Keep risk meaning in live text and existing semantic color tokens; illustration never becomes the only state carrier.
- No nested cards, negative letter spacing, decorative gradients, or page-level horizontal overflow at 320px.
- Buttons and links used as controls remain at least 44px high; focus-visible states remain intact.
- Scope changes to the production locations page and its owned components/styles only.

---

### Task 1: Build The Live Location Overview Model

**Files:**
- Create: `src/lib/domain/locationOverview.ts`
- Create: `tests/unit/locationOverview.test.ts`

**Interfaces:**
- Consumes: locations shaped as `{ id, name, foods: { name, expiresAt }[] }` from `listLocations`.
- Produces: `buildLocationOverview(locations, today)` returning `{ totalFoods, priorityCount, routeItems }` where each route item contains `locationId`, `locationName`, `foodName`, `expiresAt`, `days`, and `riskLabel`.

- [ ] **Step 1: Write failing unit tests**

Cover these exact behaviors:

```ts
expect(buildLocationOverview(locations, new Date("2026-07-10T00:00:00+08:00"))).toMatchObject({
  totalFoods: 4,
  priorityCount: 2,
  routeItems: [
    { locationId: "expired", riskLabel: "已过期" },
    { locationId: "week", riskLabel: "7 天内" },
    { locationId: "calm", riskLabel: "很安心" },
  ],
});
```

Also assert that empty locations are omitted from the route and invalid date mutation is not performed.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- tests/unit/locationOverview.test.ts`

Expected: FAIL because `@/lib/domain/locationOverview` does not exist.

- [ ] **Step 3: Implement the pure helper**

Use `differenceInCalendarDays` from `date-fns`; count every food for the metrics, keep only the earliest food from each location as a route candidate, then sort those location candidates by `expiresAt` and take the first three. Map risk labels with these boundaries:

```ts
days < 0        -> "已过期"
days === 0      -> "今天到期"
days <= 7       -> "7 天内"
days <= 30      -> "30 天内"
otherwise       -> "很安心"
```

`priorityCount` counts all active foods with `days <= 7`, including expired foods.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- tests/unit/locationOverview.test.ts`

Expected: all tests pass.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/lib/domain/locationOverview.ts tests/unit/locationOverview.test.ts
git commit -m "feat: derive live location inspection overview"
```

---

### Task 2: Build Production Forest Location Components

**Files:**
- Create: `src/components/location/LocationForestHero.tsx`
- Modify: `src/components/location/LocationCard.tsx`
- Modify: `tests/unit/uiComponents.test.tsx`
- Create: `public/images/location-forest-hero.png`

**Interfaces:**
- `LocationForestHero({ familyId, locationCount, foodCount, priorityCount })` renders the approved title, description, two actions, three metrics, and raster hero.
- `LocationCard` adds optional `fallbackVariant?: number`; existing callers remain valid.

- [ ] **Step 1: Copy the approved raster into the public asset path**

Copy `docs/visuals/forest-isometric/hero-v2.png` to `public/images/location-forest-hero.png` and verify the file is non-empty.

- [ ] **Step 2: Write failing component tests**

Add assertions that:

```ts
expect(screen.getByRole("heading", { name: "家里的森林储物图" })).toBeVisible();
expect(screen.getByRole("link", { name: "添加位置" })).toHaveAttribute("href", "/f/demo/locations/new");
expect(screen.getByRole("link", { name: "查看今日巡柜路线" })).toHaveAttribute("href", "#inspection-route");
expect(screen.getByRole("img", { name: "3D 等距森林储物地图" })).toHaveAttribute("src", "/images/location-forest-hero.png");
```

For `LocationCard` without a cover, assert a real image named `${location.name} 默认森林封面` is present and `未拍照` is absent.

- [ ] **Step 3: Run the tests and verify RED**

Run: `npm test -- tests/unit/uiComponents.test.tsx`

Expected: FAIL because `LocationForestHero` and the illustrated fallback do not exist.

- [ ] **Step 4: Implement the hero and editorial location card**

The hero uses `data-ud-check="hero-title"` and `data-ud-check="hero-illustration"`. The card remains one semantic `Link`, preserves food count, next food, expiry date, and risk badges, and uses one of five `forest-cover-position-*` classes based on `fallbackVariant % 5`.

- [ ] **Step 5: Run component tests and verify GREEN**

Run: `npm test -- tests/unit/uiComponents.test.tsx`

Expected: all tests pass.

- [ ] **Step 6: Commit Task 2**

```bash
git add public/images/location-forest-hero.png src/components/location/LocationForestHero.tsx src/components/location/LocationCard.tsx tests/unit/uiComponents.test.tsx
git commit -m "feat: add production forest location components"
```

---

### Task 3: Replace The Real Locations Page And Verify It

**Files:**
- Modify: `src/app/f/[familyId]/locations/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/mvp.spec.ts`
- Modify: `docs/superpowers/specs/2026-07-10-forest-isometric-location-map-design.md`

**Interfaces:**
- Consumes: `buildLocationOverview`, `LocationForestHero`, live `locations`, and `LocationCard`.
- Produces: the production `/f/[familyId]/locations` page with `#inspection-route` and `#location-directory` anchors.

- [ ] **Step 1: Update the E2E expectation before implementation**

Replace the old location-page heading assertion with:

```ts
await expect(page.getByRole("heading", { name: "家里的森林储物图" })).toBeVisible();
await expect(page.getByRole("heading", { name: "今天先巡这些位置" })).toBeVisible();
await expect(page.getByRole("heading", { name: "森林房间目录" })).toBeVisible();
```

- [ ] **Step 2: Run the focused E2E and verify RED**

Run: `npm run test:e2e -- --grep "demo family can move"`

Expected: FAIL on the old production page heading.

- [ ] **Step 3: Replace the page composition**

Render a scoped `forest-locations-page` main with:

1. compact top rail `HOME FOOD MAP / 位置地图`;
2. `LocationForestHero`;
3. full-width editorial band containing `#inspection-route` and `#location-directory`;
4. route rows linked to live location detail pages;
5. all live locations rendered with `LocationCard fallbackVariant={index}`;
6. the existing empty-state creation link;
7. existing `BottomNav`.

- [ ] **Step 4: Add scoped responsive CSS**

Use the approved colors `#f8eee2`, `#173f32`, `#102e26`, `#748e58`, `#b76535`, `#dda45a`, `#a9a7d8`, `#16261f`, and `#66736c`. Desktop uses a 38/62 editorial hero split; 768px stacks copy before art; 420px uses a 270px right-anchored crop with the raster at `165vw`. Keep the content band unframed, use separators rather than card nesting, and reserve stable image dimensions.

- [ ] **Step 5: Update the design contract**

Record that the visual direction is now applied to the production locations route, while data and navigation behavior remain unchanged.

- [ ] **Step 6: Run verification**

Run in order:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 7: Render browser evidence**

Run the production dev server and verify `/f/demo/locations` at 1440x1000 and 375x812:

- title is the first read;
- hero image is unframed and not rectangularly shadowed;
- live counts match the rendered location data;
- both actions work and are at least 44px high;
- route links and location cards navigate to existing detail routes;
- mobile title does not clip and page-level horizontal overflow is absent;
- bottom navigation does not cover the final location entry.

- [ ] **Step 8: Commit Task 3**

```bash
git add src/app/f/[familyId]/locations/page.tsx src/app/globals.css tests/e2e/mvp.spec.ts docs/superpowers/specs/2026-07-10-forest-isometric-location-map-design.md
git commit -m "feat: replace locations page with forest map UI"
```

## Self Review

- Spec coverage: the plan maps the approved 3D asset, strong typography, deep-green palette, cat detail, live counts, route list, location directory, illustrated fallbacks, and responsive evidence into production code.
- Placeholder scan: no TBD, TODO, deferred implementation, or undefined interface remains.
- Type consistency: Task 1 produces the overview consumed by Task 3; Task 2 preserves `LocationCard` compatibility and produces the hero consumed by Task 3.
- Scope integrity: no database schema, server mutation, location detail, add-location, or unrelated page is redesigned.
