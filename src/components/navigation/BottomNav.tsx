"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Map, PlusCircle, ScrollText, Users } from "lucide-react";

const items = [
  { label: "提醒", href: "", icon: Bell },
  { label: "位置", href: "/locations", icon: Map },
  { label: "添加", href: "/add", icon: PlusCircle, featured: true },
  { label: "记录", href: "/records", icon: ScrollText },
  { label: "家庭", href: "/family", icon: Users },
];

function isActive(pathname: string | null, familyId: string, href: string) {
  if (!pathname) return false;
  const target = `/f/${familyId}${href}`;
  if (!href) return pathname === target;
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function BottomNav({ familyId }: { familyId: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="主导航"
      className="bottom-nav-surface fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border)] backdrop-blur"
    >
      <div className="mx-auto grid min-h-20 max-w-5xl grid-cols-5 px-2 pb-2 pt-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, familyId, item.href);
          return (
            <Link
              key={item.label}
              href={`/f/${familyId}${item.href}`}
              aria-current={active ? "page" : undefined}
              className={[
                "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-bold",
                active
                  ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] shadow-[inset_0_0_0_1px_var(--color-border)]"
                  : "text-slate-600 hover:bg-[var(--color-muted)] hover:text-slate-950",
                item.featured && !active ? "text-[var(--color-accent)]" : "",
              ].join(" ")}
            >
              {active ? <span className="absolute top-1 h-1 w-6 rounded-full bg-[var(--color-primary)]" /> : null}
              <Icon aria-hidden className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
