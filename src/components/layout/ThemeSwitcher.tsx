"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const themes = [
  {
    id: "strawberry",
    label: "D",
    name: "米白草莓",
    description: "当前偏好，软萌明亮",
    colors: ["#FFFCF7", "#F472B6", "#2DD4BF"],
  },
  {
    id: "provence-linen",
    label: "K",
    name: "法式亚麻",
    description: "薰衣草、鼠尾草、奶白",
    colors: ["#FFFCF5", "#7C6A9A", "#8FAE7E"],
  },
  {
    id: "tuscan-pantry",
    label: "L",
    name: "托斯卡纳",
    description: "橄榄绿、番茄红、陶罐感",
    colors: ["#FFF9EF", "#6B8E23", "#C65D3A"],
  },
  {
    id: "olive-terracotta",
    label: "M",
    name: "橄榄陶土",
    description: "乡村厨房，温暖但克制",
    colors: ["#FBFAF4", "#708238", "#B86B4B"],
  },
  {
    id: "strawberry-pudding",
    label: "H",
    name: "草莓奶冻",
    description: "更柔和，更耐看",
    colors: ["#FFF9F6", "#E85D8F", "#FB923C"],
  },
  {
    id: "peach-bento",
    label: "J",
    name: "桃子便当",
    description: "更食物，更温暖",
    colors: ["#FFFBF4", "#F97373", "#A7F3D0"],
  },
  {
    id: "cherry-yogurt",
    label: "I",
    name: "樱桃酸奶",
    description: "更活泼，更明亮",
    colors: ["#FFFDFB", "#E11D48", "#FEF3C7"],
  },
] as const;

type ThemeId = (typeof themes)[number]["id"];

const storageKey = "home-food-map-theme";
const defaultTheme: ThemeId = "provence-linen";

function isThemeId(value: string | null): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}

function applyTheme(themeId: ThemeId) {
  document.documentElement.dataset.theme = themeId;
}

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const savedTheme = localStorage.getItem(storageKey);
    return isThemeId(savedTheme) ? savedTheme : defaultTheme;
  });

  useEffect(() => {
    applyTheme(activeTheme);
    localStorage.setItem(storageKey, activeTheme);
  }, [activeTheme]);

  const activeThemeName = themes.find((theme) => theme.id === activeTheme)?.name ?? "法式亚麻";

  return (
    <section className="linen-stripe rounded-lg border border-[var(--color-border)] p-3 transition-colors">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">配色试衣间</p>
          <p className="mt-0.5 text-xs text-slate-500">点按钮切换，选择会自动保存到这个浏览器。</p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--color-primary-strong)]">
          当前：{activeThemeName}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              aria-pressed={isActive}
              className={[
                "group min-h-16 cursor-pointer rounded-md border p-3 text-left transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] shadow-[0_0_0_3px_var(--color-accent-soft)]"
                  : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-muted)]",
              ].join(" ")}
              onClick={() => setActiveTheme(theme.id)}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-black text-slate-950">
                    {theme.label} · {theme.name}
                  </span>
                  {isActive ? <Check aria-hidden className="h-4 w-4 shrink-0 text-[var(--color-primary-strong)]" /> : null}
                </span>
                <span className="flex shrink-0 overflow-hidden rounded-full border border-white">
                  {theme.colors.map((color) => (
                    <span key={color} className="h-4 w-4" style={{ backgroundColor: color }} />
                  ))}
                </span>
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-600">{theme.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
