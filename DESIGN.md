---
version: alpha
name: 家里还有啥
description: Mobile-first household food inventory UI for expiry reminders and location-based storage.

colors:
  primary: "#33768b"
  secondary: "#4f8f72"
  tertiary: "#ffd666"
  neutral: "#5c7480"
  surface: "#ffffff"
  on-surface: "#14242d"
  error: "#873023"

typography:
  headline-lg:
    fontFamily: "Arial, Microsoft YaHei, PingFang SC, sans-serif"
    fontSize: "28px"
    fontWeight: 900
    lineHeight: "1.2"
  body-md:
    fontFamily: "Arial, Microsoft YaHei, PingFang SC, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.65"
  label-md:
    fontFamily: "Arial, Microsoft YaHei, PingFang SC, sans-serif"
    fontSize: "14px"
    fontWeight: 800
    lineHeight: "1.3"

rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 10px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
---

# Design System

## Overview

The app is a clean household inventory cockpit, not a decorative pantry scrapbook. The primary user is a family member, often mom, checking a phone quickly to decide what to eat, move, discard, or add. The UI should feel like a bright family fridge whiteboard: calm, legible, slightly soft, and domestic while keeping expiry risk and storage location unmistakable.

## Colors

Use cool-white surfaces, fridge-blue for primary actions, soft sticky-note yellow for warmth, and semantic coral/yellow/green risk colors for expiry urgency. Risk color must always be paired with text, count, or position, never used as the only signal. Avoid large dark headers and avoid making the selected H2 direction look like a generic blue SaaS dashboard.

## Typography

Typography is utility-first. Headings may be bold and friendly, but body text, controls, dates, quantities, and state language must stay plain and large enough for mobile scanning. Letter spacing remains 0 except for small eyebrow labels already present in the app.

## Layout

Mobile comes first. The first screen should show a risk summary, a short today action queue, then grouped expiry detail. Location pages use a route/checklist model: show which storage spots to inspect before showing the full cabinet list.

## Elevation & Depth

Cards are for repeated actionable items only. Page sections use bands, queues, dividers, and compact panels before adding more card containers. Shadows stay quieter than the previous warm-paper direction; use light borders and whiteboard-like separation before depth.

## Shapes

Controls and repeated inventory cards use 8 to 12 px radius. Pills are reserved for status, quantities, dates, filters, and small numbered whiteboard/magnet cues. Avoid making every page block a rounded card.

## Components

Food cards show: food name, expiry notice, quantity, location, date, and three direct actions: take one, eat today, discard. Location cards show inventory count, nearest expiry, and risk badges. The dashboard owns `TodayActionQueue`; the location map owns the inspection route.

## Do's and Don'ts

Do use direct household copy such as "今天吃掉", "拿走 1 件", and "不能吃了，丢掉". Do preserve explicit location ownership. Do not imply the app auto-detects where food belongs. Do not add decorative badges, fake proof, dark companion-frame headers, or heavier "cute house" game UI until the core reminders are faster to use.

## Agent Execution Rules

- Read this file before meaningful UI changes.
- Prefer existing CSS variables and component classes before inventing new tokens.
- Keep UI copy consistent with the household action language.
- Verify mobile layout, overflow, and action labels before claiming completion.

## Request Anchor

- Original user request: 用 `$ultimate-design` 重新对 `home-food-map` 的 UI 进行重构。
- Latest user override: 用户确认采用 H2 “清爽白板可爱版”方向：简约、清爽、带一点可爱，但不要大面积深色头部。
- Deliverable: Product UI refactor in the existing Next.js app plus this design contract.
- Primary audience: 家庭成员，尤其是希望少打字、少学习、快速处理食物到期的妈妈。
- Core job to be done: 打开手机后快速知道今天先处理什么，以及应该先巡哪个柜子或冰箱位置。
- Success criteria: 首屏能看见风险摘要和今日处理队列；位置地图能给出巡柜顺序；按钮文案直接说明结果；移动端不出现横向溢出或文字挤压。
- Non-goals: 不新增登录、云数据库、菜谱、购物清单、照片自动判断食物位置或游戏化养成系统。
- Must preserve: 现有业务逻辑、Server Actions、显式位置归属、确认后入库、已有家庭/记录/添加流程。
- Validation must check against: unit tests for component copy and structure, build, and rendered mobile/desktop sanity.

## Content Model

- User intent: 快速处理快到期库存，减少浪费。
- Message hierarchy: 先看风险总览，再看今日要处理的少数项，再看完整分组和位置。
- First-screen answers: 今天先处理什么；有几件紧急；下一步可添加或处理。
- Primary action meaning: 拿走减少数量；今天吃掉清空并标记完成；不能吃了丢掉则退出库存。
- Voice and tone: 家庭、明确、不责备；紧急时直接但不吓人。
- Terminology rules: 统一使用“位置”“库存”“到期”“拿走”“今天吃掉”“丢掉”“巡柜”。
- State language rules: 空状态说明当前没有急事并给出下一步。
- Trust, risk, and help content: AI/识别结果仍必须确认；位置照片只帮助识别位置，不自动归属食物。
- Content risks: 过期食品处理不能暗示仍可食用；文案使用“确认是否还能处理”而不是建议食用。

## OKF Preflight

- Active references loaded: `branch-web-product.md`, `content-model.md`, `design-contract.md`, `quality-gates.md`, `visual-verification.md`, OKF `index.md`, `product-sense.md`, `taste-engine.md`, `ux-writing.md`, Next local Server/Client Components and Server Actions docs; later visual-companion comparisons selected H2.
- Constraints extracted: Product UI favors clarity, recovery, large controls, visible labels, semantic HTML, quiet taste, and validation evidence. CTAs should say action plus result. Visual work needs a durable contract and rendered verification where practical.
- Deliberate exceptions: The app keeps a small warm home/cabinet motif because location memory matters, but it is demoted below the task queue and inspection route.
- Verification hooks: `tests/unit/uiComponents.test.tsx`, `npm run build`, `npm run test:e2e -- tests/e2e/mvp.spec.ts`, mobile and desktop browser screenshots when possible.

## Information Architecture

- Core user tasks: decide what to process today; filter by location; inspect a cabinet; add inventory; mark item changes.
- Page inventory: reminder dashboard, location map, location detail, add food, records, family.
- Navigation model: bottom nav remains the primary mobile route; page actions stay top-right in headers.
- Content hierarchy: risk summary and today queue before full lists; inspection route before full location cards.
- Primary CTA rules: Use one main page action such as "添加食物" or "添加位置"; row actions are direct inventory changes.

## Taste Signature

- Design read: Clean fridge-whiteboard household cockpit with light cute cues.
- Necessary judgment: Demote decorative house language when it competes with expiry decisions.
- Taste dials: visual variance 4, information density 7, motion depth 1, brand distinction 5, type expressiveness 2, experiment risk 2.
- Category defaults avoided: Generic card wall, cute game-first pantry, pastel-only decoration, generic blue SaaS dashboard, dark header shell, vague "处理" labels.
- Layout families or slide archetypes: summary band, priority queue, grouped inventory list, inspection route, location list.
- Visual memory feature: Fridge-whiteboard grid, soft blue borders, small numbered magnet/counter cues, and botanical cat-detail location illustrations.
- Type personality: Utility CJK UI type, bold labels for scan points.
- Asset/reference policy: Real location photos are preferred. When a location has no photo, use the default PNG illustration set in `/public/illustrations/location-icons/`: refined botanical fairy-tale storage furniture with subtle cat-ear, paw, and tail details. These assets are decorative cues and must not imply automatic food recognition.
- Anti-default locks: No decorative badges without state meaning; no large dark header; no new gradient hero; no nested cards; no sweet sticker overload.
- Intentional exceptions: Risk badges may use pills because urgency must be scannable.

## Page Or Asset Specs

Reminder dashboard:
- Goal: Show what to handle first.
- Primary user task: Process or defer urgent food.
- Primary content: summary counts, today action queue, grouped expiry sections.
- Primary CTA: 添加食物.
- Required states: no urgent items, filtered location, mixed risk groups.

Location map:
- Goal: Show where to inspect next.
- Primary user task: Choose a storage location by risk and room.
- Primary content: inspection route, room groupings, location cards.
- Primary CTA: 添加位置.
- Required states: no locations, empty room, urgent location, calm location.
- Default logo rule: Classify by location name/tags into cabinet, fridge, box, shelf, or drawer; render the matching PNG illustration in both the home map and photo-less location cards. Keep labels visible because the illustration is decorative, not the only meaning carrier.

## Quality Gates

- Request Anchor fit: The UI must make the approved operation-table direction visible.
- Visual: The strongest elements are risk summary, today queue, and inspection route.
- Accessibility: Buttons have visible text or names; color is not the only signal.
- Responsive: No page-level horizontal scroll at 320 px; bottom nav does not cover content.
- Interaction: Inventory actions provide direct labels and preserve existing mutation paths.
- Performance: Avoid extra client JavaScript for static server-rendered surfaces.
- Contract consistency: New UI patterns and copy stay aligned with this file.

## Implementation And Governance

- CSS architecture: Continue using `src/app/globals.css` variables and component classes.
- Token implementation: Use existing CSS custom properties; update tokens only when a persistent role changes.
- Component naming: Components describe user jobs, for example `TodayActionQueue`.
- State naming: Keep domain statuses unchanged.
- Theme strategy: Existing theme variants may remain, but the default direction should become H2 clean whiteboard: cool white, fridge blue, soft yellow/coral risk states, and light cute cues.
- Rendered UI Audit: Not yet automated for the Next app; use Playwright screenshots as the practical visual check.

## Assumptions

- The current visual theme controls are experimental and should not dominate the redesigned default.
- Existing demo data is enough to validate dashboard and location-map states.

## Open Questions

- 是否后续需要正式的“长辈友好模式”开关，还是始终把默认 UI 做成长辈友好。
- 位置地图未来是否要继续增强为可拖拽平面图，目前先保持轻量巡柜路线。

## Review Log

| Version | Date | Change | Reason | Reviewer |
|---|---|---|---|---|
| 0.1 | 2026-07-09 | Initial UI refactor contract | User approved household inventory cockpit direction | Codex |
| 0.2 | 2026-07-09 | Selected H2 clean whiteboard visual direction | User chose H2 after visual comparison and rejected large dark header feel | Codex |
| 0.3 | 2026-07-09 | Implemented H2 tokens, whiteboard summary, action queue, location map, and default theme migration | Make the selected clean whiteboard direction visible on localhost and prevent stale dark/warm defaults | Codex |
| 0.4 | 2026-07-09 | Added botanical fairy-tale cat-detail PNG location illustrations for default logos | User wanted truly illustrated, more refined default cabinet logos with subtle cat elements | Codex |
