import Link from "next/link";
import { Bell, Map, PlusCircle, ScrollText, Users } from "lucide-react";

const items = [
  { label: "提醒", href: "", icon: Bell },
  { label: "位置", href: "/locations", icon: Map },
  { label: "添加", href: "/add", icon: PlusCircle },
  { label: "记录", href: "/records", icon: ScrollText },
  { label: "家庭", href: "/family", icon: Users },
];

export function BottomNav({ familyId }: { familyId: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={`/f/${familyId}${item.href}`}
            className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-slate-700"
          >
            <Icon aria-hidden className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
