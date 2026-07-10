import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf8");

function extractBlock(source: string, marker: string) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return "";

  const openIndex = source.indexOf("{", markerIndex);
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(openIndex + 1, index);
  }
  return "";
}

function extractRule(source: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
}

function parseHexColor(source: string, token: string) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const value = source.match(new RegExp(`${escaped}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
  if (!value) throw new Error(`Missing color token ${token}`);
  return value;
}

function relativeLuminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

describe("production forest locations CSS contract", () => {
  it("keeps the mobile content band inside the visible area above bottom navigation", () => {
    const desktopArt = extractRule(css, ".forest-locations-page .forest-hero-art");
    const desktopShell = extractRule(css, ".forest-locations-page .forest-diorama-shell");
    const canvas = extractRule(css, ".forest-locations-page .forest-diorama-shell canvas");
    const tablet = extractBlock(css, "@media (max-width: 768px)");
    const tabletArt = extractRule(tablet, ".forest-locations-page .forest-hero-art");
    const tabletShell = extractRule(tablet, ".forest-locations-page .forest-diorama-shell");
    const mobile = extractBlock(css, "@media (max-width: 420px)");
    const topbar = extractRule(mobile, ".forest-locations-page .forest-locations-topbar");
    const heroCopy = extractRule(mobile, ".forest-locations-page .forest-hero-copy");
    const eyebrow = extractRule(mobile, ".forest-locations-page .forest-hero-eyebrow");
    const lead = extractRule(mobile, ".forest-locations-page .forest-hero-lead");
    const actions = extractRule(mobile, ".forest-locations-page .forest-hero-actions");
    const metrics = extractRule(mobile, ".forest-locations-page .forest-hero-metrics");
    const art = extractRule(mobile, ".forest-locations-page .forest-hero-art");
    const mobileShell = extractRule(mobile, ".forest-locations-page .forest-diorama-shell");

    expect(desktopArt).toMatch(/margin-right:\s*0/);
    expect(desktopShell).toMatch(/width:\s*min\(760px,\s*100%\)/);
    expect(desktopShell).toMatch(/height:\s*min\(620px,\s*58vw\)/);
    expect(canvas).toMatch(/background:\s*transparent/);
    expect(canvas).toMatch(/touch-action:\s*none/);
    expect(tabletArt).toMatch(/justify-content:\s*center/);
    expect(tabletArt).toMatch(/margin:\s*0/);
    expect(tabletShell).toMatch(/height:\s*360px/);
    expect(topbar).toMatch(/min-height:\s*44px/);
    expect(heroCopy).toMatch(/padding:\s*16px 0 0/);
    expect(eyebrow).toMatch(/margin:\s*0 0 6px/);
    expect(lead).toMatch(/margin-top:\s*10px/);
    expect(lead).toMatch(/line-height:\s*1\.55/);
    expect(actions).toMatch(/gap:\s*8px/);
    expect(actions).toMatch(/margin-top:\s*16px/);
    expect(metrics).toMatch(/margin-top:\s*16px/);
    expect(art).toMatch(/height:\s*270px/);
    expect(art).toMatch(/margin:\s*0/);
    expect(mobileShell).toMatch(/height:\s*270px/);
    expect(css).not.toContain(".forest-locations-page .forest-hero-art img");
  });

  it("shows complete furniture illustrations in photo-less location cards", () => {
    const card = extractRule(css, ".forest-locations-page .forest-location-card");
    const cover = extractRule(css, ".forest-locations-page .forest-location-cover");
    const illustration = extractRule(
      css,
      ".forest-locations-page .forest-location-cover img.forest-location-object-illustration",
    );
    const mobile = extractBlock(css, "@media (max-width: 420px)");
    const mobileCard = extractRule(mobile, ".forest-locations-page .forest-location-card");

    expect(card).toMatch(/align-items:\s*start/);
    expect(cover).toMatch(/aspect-ratio:\s*4\s*\/\s*3/);
    expect(cover).toMatch(/align-self:\s*start/);
    expect(cover).toMatch(/min-height:\s*0/);
    expect(illustration).toMatch(/object-fit:\s*contain/);
    expect(illustration).toMatch(/padding:\s*8px/);
    expect(illustration).toMatch(/transform:\s*none/);
    expect(mobileCard).toMatch(/grid-template-columns:\s*112px minmax\(0,\s*1fr\)/);
    expect(mobileCard).toMatch(/gap:\s*12px/);
    expect(css).not.toContain("forest-cover-position-");
  });

  it("uses accessible text and focus colors on both light forest surfaces", () => {
    const root = extractRule(css, ".forest-locations-page");
    const focus = extractRule(css, ".forest-locations-page :where(a, button):focus-visible");
    const paper = parseHexColor(root, "--forest-paper");
    const surface = parseHexColor(root, "--forest-surface");
    const moss = parseHexColor(root, "--forest-moss");
    const muted = parseHexColor(root, "--forest-muted");
    const primary = parseHexColor(root, "--forest-primary");

    for (const textColor of [moss, muted]) {
      expect(contrastRatio(textColor, paper)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(textColor, surface)).toBeGreaterThanOrEqual(4.5);
    }
    expect(focus).toContain(`outline: 3px solid var(--forest-primary)`);
    expect(contrastRatio(primary, paper)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(primary, surface)).toBeGreaterThanOrEqual(3);
  });
});
