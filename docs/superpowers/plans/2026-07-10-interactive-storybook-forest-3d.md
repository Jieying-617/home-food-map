# Interactive Storybook Forest 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the baked-background hero PNG with a real interactive storybook forest diorama that rotates, zooms, and casts a seamless transparent shadow.

**Architecture:** Render a procedural Three.js scene through React Three Fiber inside a client component boundary. Keep live hero copy and metrics server-rendered, while the canvas owns only decorative geometry and OrbitControls. Use a transparent renderer and Drei `ContactShadows` so the model and its shadow composite directly onto the page background.

**Tech Stack:** Next.js 16, React 19, TypeScript, Three.js, `@react-three/fiber`, `@react-three/drei`, Vitest, Testing Library, in-app browser visual verification.

## Global Constraints

- Selected visual direction is `立体绘本森林`: believable timber and moss textures expressed through sculpted geometry, vivid flowers and mushrooms, one orange cat, and one black-and-white cat.
- The forest must be a real WebGL scene, not a raster plane or CSS tilt effect.
- Horizontal rotation is 360 degrees; vertical rotation and zoom are constrained to keep the model recoverable.
- The WebGL canvas is transparent; no rectangular background, gradient, or baked shadow is permitted.
- Shadow remains attached to the model and fades naturally into the page through a transparent contact-shadow pass.
- Mouse drag, wheel zoom, touch drag, and pinch zoom are supported; panning is disabled.
- A reset-view icon button is keyboard accessible and has a visible tooltip/accessible name.
- Mobile interaction must not create page-level horizontal overflow or hide the model.
- Static hero copy, actions, metrics, location data, and navigation behavior remain unchanged.

---

### Task 1: Add The 3D Runtime And Interaction Contract

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/location/ForestDiorama.tsx`
- Create: `tests/unit/forestDiorama.test.tsx`

**Interfaces:**
- Produces: `ForestDiorama`, an accessible client component with a transparent `Canvas`, constrained `OrbitControls`, and `重置3D视角` action.

- [x] **Step 1: Install `three`, `@react-three/fiber`, and `@react-three/drei`.**
- [x] **Step 2: Write a failing component test for the interactive region and reset control.**
- [x] **Step 3: Verify RED because `ForestDiorama` does not exist.**
- [x] **Step 4: Implement the minimal canvas shell and controls.**
- [x] **Step 5: Verify the focused test passes.**

### Task 2: Build The Storybook Forest Scene

**Files:**
- Create: `src/components/location/ForestDioramaScene.tsx`
- Test: `tests/unit/forestDiorama.test.tsx`

**Interfaces:**
- Produces: `ForestDioramaScene`, a grouped model containing island, cottage, trees, path, storage furniture, mushrooms, flowers, two cats, lights, and contact shadows.

- [x] **Step 1: Add a failing source contract test for the required scene groups and contact shadow.**
- [x] **Step 2: Verify RED because the scene module is missing.**
- [x] **Step 3: Implement reusable geometry components and the complete diorama.**
- [x] **Step 4: Verify the focused scene contract passes.**

### Task 3: Replace The Raster Hero And Govern Responsive Layout

**Files:**
- Modify: `src/components/location/LocationForestHero.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/unit/uiComponents.test.tsx`
- Modify: `tests/unit/forestLocationsProduction.test.ts`

**Interfaces:**
- Consumes: `ForestDiorama`.
- Produces: a stable responsive `.forest-diorama-shell` that replaces the PNG inside `.forest-hero-art`.

- [x] **Step 1: Change hero tests to require the 3D region and reject the old hero PNG.**
- [x] **Step 2: Verify RED against the current raster hero.**
- [x] **Step 3: Replace the image, remove raster crop rules, and add desktop/mobile canvas sizing.**
- [x] **Step 4: Run focused and full unit tests, lint, and production build.**
- [x] **Step 5: Verify canvas pixels, rotation, zoom, reset, framing, and overflow at 1440x900, 375x812, and 320x812.**
