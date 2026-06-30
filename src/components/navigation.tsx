"use client";

import Link from "next/link";
import { Inbox, ListCheck } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "決まったこと",
    icon: ListCheck
  },
  {
    href: "/seedbox",
    label: "なんでもボックス",
    icon: Inbox
  }
] as const;

export default function Navigation() {
  const pathname = usePathname();

  function isActive(path: string) {
    return pathname === path;
  }

  return (
    <nav
      aria-label="メインナビゲーション"
      className="w-full shrink-0 border-t border-gray-200 bg-white/95 px-3 py-1.5 pb-[calc(env(safe-area-inset-bottom)+0.375rem)] shadow-[0_-4px_16px_rgba(15,23,42,0.04)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-2 gap-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center rounded-xl px-3 py-1.5 text-[11px] font-medium leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${
                  active
                    ? "bg-green-50 text-green-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <Icon
                  size={24}
                  strokeWidth={2.25}
                  absoluteStrokeWidth
                  aria-hidden="true"
                  className={active ? "text-green-700" : "text-gray-400"}
                />
                <span className="mt-0.5 whitespace-nowrap">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
