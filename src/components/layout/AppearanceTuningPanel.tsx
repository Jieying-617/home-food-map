"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AppearanceSettings = {
  texture: number;
  depth: number;
  sheen: number;
  border: number;
  radius: number;
  density: number;
  button: number;
  nav: number;
  scrollbar: number;
  emphasis: number;
};

type StoredAppearanceSettings = Partial<AppearanceSettings> & {
  material?: number;
};

const storageKey = "home-food-map-appearance-tuning";
const defaults: AppearanceSettings = {
  texture: 5,
  depth: 6,
  sheen: 5,
  border: 5,
  radius: 5,
  density: 5,
  button: 5,
  nav: 5,
  scrollbar: 6,
  emphasis: 7,
};

const controls: Array<{
  key: keyof AppearanceSettings;
  label: string;
  low: string;
  high: string;
  group: "空间" | "材质" | "控件";
}> = [
  { key: "texture", label: "背景纹理", low: "净", high: "纹", group: "材质" },
  { key: "depth", label: "卡片浮起", low: "平", high: "浮", group: "空间" },
  { key: "sheen", label: "卡片高光", low: "哑", high: "亮", group: "材质" },
  { key: "border", label: "边框清晰", low: "隐", high: "显", group: "空间" },
  { key: "radius", label: "圆角", low: "利", high: "软", group: "空间" },
  { key: "density", label: "内容间距", low: "松", high: "密", group: "空间" },
  { key: "button", label: "按钮立体", low: "平", high: "按", group: "控件" },
  { key: "nav", label: "底栏浮起", low: "贴", high: "悬", group: "控件" },
  { key: "scrollbar", label: "滚动条", low: "轻", high: "明", group: "控件" },
  { key: "emphasis", label: "状态强调", low: "轻", high: "强", group: "控件" },
];

const groups = ["空间", "材质", "控件"] as const;

function clamp(value: number) {
  return Math.min(10, Math.max(1, Math.round(value)));
}

function readSettings(): AppearanceSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "") as StoredAppearanceSettings;
    return {
      texture: clamp(parsed.texture ?? defaults.texture),
      depth: clamp(parsed.depth ?? defaults.depth),
      sheen: clamp(parsed.sheen ?? parsed.material ?? defaults.sheen),
      border: clamp(parsed.border ?? defaults.border),
      radius: clamp(parsed.radius ?? defaults.radius),
      density: clamp(parsed.density ?? defaults.density),
      button: clamp(parsed.button ?? defaults.button),
      nav: clamp(parsed.nav ?? defaults.nav),
      scrollbar: clamp(parsed.scrollbar ?? defaults.scrollbar),
      emphasis: clamp(parsed.emphasis ?? defaults.emphasis),
    };
  } catch {
    return defaults;
  }
}

function applySettings(settings: AppearanceSettings) {
  const root = document.documentElement;
  const texture = settings.texture;
  const depth = settings.depth;
  const sheen = settings.sheen;
  const border = settings.border;
  const radius = settings.radius;
  const density = settings.density;
  const button = settings.button;
  const nav = settings.nav;
  const scrollbar = settings.scrollbar;
  const emphasis = settings.emphasis;

  root.style.setProperty("--ui-radius-card", `${0.28 + radius * 0.07}rem`);
  root.style.setProperty("--ui-radius-control", `${0.22 + radius * 0.045}rem`);
  root.style.setProperty("--ui-page-gap", `${1.6 - density * 0.07}rem`);
  root.style.setProperty("--ui-page-pad-y", `${1.65 - density * 0.055}rem`);
  root.style.setProperty("--ui-card-padding-scale", `${1.08 - density * 0.018}`);
  root.style.setProperty("--ui-shadow-card", `0 ${6 + depth * 2}px ${16 + depth * 5}px rgba(72, 55, 38, ${0.035 + depth * 0.01})`);
  root.style.setProperty("--ui-shadow-raised", `0 ${4 + depth}px ${10 + depth * 3}px rgba(72, 55, 38, ${0.03 + depth * 0.008})`);
  root.style.setProperty("--ui-inner-highlight", `${0.28 + sheen * 0.06}`);
  root.style.setProperty("--ui-background-texture", `${0.12 + texture * 0.075}`);
  root.style.setProperty("--ui-surface-sheen", `${0.12 + sheen * 0.052}`);
  root.style.setProperty("--ui-card-border-width", `${0.65 + border * 0.16}px`);
  root.style.setProperty("--ui-control-border-width", `${0.75 + border * 0.13}px`);
  root.style.setProperty("--ui-button-shadow", `0 ${2 + button}px ${6 + button * 2.4}px rgba(72, 55, 38, ${0.025 + button * 0.01})`);
  root.style.setProperty("--ui-button-inset", `inset 0 1px 0 rgba(255,255,255,${0.18 + button * 0.045})`);
  root.style.setProperty("--ui-nav-shadow", `0 -${5 + nav}px ${14 + nav * 4}px rgba(72, 55, 38, ${0.05 + nav * 0.012})`);
  root.style.setProperty("--ui-nav-bg-alpha", `${0.82 + nav * 0.014}`);
  root.style.setProperty("--ui-scrollbar-height", `${0.26 + scrollbar * 0.055}rem`);
  root.style.setProperty("--ui-scrollbar-strength", `${28 + scrollbar * 7}%`);
  root.style.setProperty("--ui-risk-border-width", `${1 + emphasis * 0.22}px`);
  root.style.setProperty("--ui-risk-mark-width", `${3 + emphasis * 0.7}px`);
}

export function AppearanceTuningPanel() {
  const [settings, setSettings] = useState<AppearanceSettings>(() => readSettings());

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  const summary = useMemo(
    () => `10 项 · ${Math.round(Object.values(settings).reduce((total, value) => total + value, 0) / Object.values(settings).length)}`,
    [settings],
  );

  function updateSetting(key: keyof AppearanceSettings, value: number) {
    setSettings((current) => ({ ...current, [key]: clamp(value) }));
  }

  function reset() {
    setSettings(defaults);
  }

  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="icon-tile">
            <SlidersHorizontal aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-950">质感调节</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">拖动滑块，页面会实时变化。</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--color-primary-strong)]">
          {summary}
        </span>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-2 px-1 text-xs font-black uppercase text-[var(--color-primary)]">{group}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {controls
                .filter((control) => control.group === group)
                .map((control) => (
                  <label key={control.key} className="appearance-control">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-700">{control.label}</span>
                      <span className="tabular-nums text-sm font-black text-[var(--color-primary-strong)]">{settings[control.key]}</span>
                    </span>
                    <span className="mt-2 flex items-center gap-3">
                      <span className="w-4 text-xs font-bold text-slate-500">{control.low}</span>
                      <input
                        aria-label={control.label}
                        className="appearance-slider"
                        type="range"
                        min="1"
                        max="10"
                        value={settings[control.key]}
                        onChange={(event) => updateSetting(control.key, Number(event.target.value))}
                      />
                      <span className="w-4 text-xs font-bold text-slate-500">{control.high}</span>
                    </span>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>

      <button className="btn-quiet mt-4 w-full sm:w-auto" type="button" onClick={reset}>
        <RotateCcw aria-hidden className="h-4 w-4" />
        恢复默认
      </button>
    </section>
  );
}

