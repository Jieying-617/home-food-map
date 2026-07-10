# Forest Cabinet Directory Illustrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace photo-less forest directory room crops with the existing botanical storage-furniture illustrations.

**Architecture:** Keep real location photos as the first choice. For photo-less locations, reuse `getLocationIllustrationType` to classify the location from its name and tags, then render the matching optimized PNG inside the existing directory cover frame.

**Tech Stack:** Next.js 16, React 19, TypeScript, `next/image`, Vitest, Testing Library.

## Global Constraints

- Preserve real uploaded photos and location navigation.
- Use the existing assets under `/public/illustrations/location-icons/`.
- Keep location names and risk text visible; illustrations remain decorative support.
- Show each furniture object completely with `object-fit: contain` at mobile and desktop sizes.
- Do not add a new API, generation flow, or client-side state.

---

### Task 1: Replace The Directory Fallback Artwork

**Files:**
- Modify: `src/components/location/LocationIllustration.tsx`
- Modify: `src/components/location/LocationCard.tsx`
- Modify: `src/app/f/[familyId]/locations/page.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/unit/uiComponents.test.tsx`
- Test: `tests/unit/forestLocationsProduction.test.ts`

**Interfaces:**
- Consumes: `getLocationIllustrationType({ name, tags })`.
- Produces: `getLocationIllustrationSrc(type)` returning a public PNG path.

- [x] **Step 1: Write failing tests**

Assert that a photo-less snack cabinet uses `cabinet.png`, a photo-less refrigerator uses `fridge.png`, and directory fallback artwork uses a complete-object CSS class with `object-fit: contain`.

- [x] **Step 2: Verify RED**

Run: `npm test -- tests/unit/uiComponents.test.tsx tests/unit/forestLocationsProduction.test.ts`

Expected: FAIL because the card still renders `location-forest-hero.png` and crop-position classes.

- [x] **Step 3: Implement the minimal replacement**

Export `getLocationIllustrationSrc`, classify each photo-less location, render the matching asset with `next/image`, remove `fallbackVariant`, and replace crop transforms with complete-object sizing.

- [x] **Step 4: Verify GREEN and rendered output**

Run the focused tests, the full test suite, lint, and build. Inspect `/f/demo/locations` at 375 px and 1440 px widths.
