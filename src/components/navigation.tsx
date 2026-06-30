"use client";

import Link from "next/link";
import { ListCheck, Inbox } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  function isActive(path: string) {
    return pathname === path;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 min-h-24 border-t border-gray-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2">
      <ul className="mx-auto flex max-w-2xl items-center justify-center gap-8">
        <Link href="/">
          <li className="flex flex-col items-center justify-center">
            <ListCheck
              size={48}
              absoluteStrokeWidth
              color={isActive("/") ? "#008236" : "#99a1af"}
            />
            <p className={isActive("/") ? "text-green-700" : "text-gray-400"}>決まったこと</p>
          </li>
        </Link>

        <Link href="/seedbox">
          <li className="flex flex-col items-center justify-center">
            <Inbox
              size={48}
              absoluteStrokeWidth
              color={isActive("/seedbox") ? "#008236" : "#99a1af"}
            />
            <p className={isActive("/seedbox") ? "text-green-700" : "text-gray-400"}>
              なんでもボックス
            </p>
          </li>
        </Link>
      </ul>
    </nav>
  );
}
