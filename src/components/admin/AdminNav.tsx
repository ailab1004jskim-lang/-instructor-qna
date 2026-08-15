"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/admin";

const ITEMS = [
  { href: "/admin", label: "질문" },
  { href: "/admin/topics", label: "질문 유형" },
  { href: "/admin/settings", label: "설정" },
];

export function AdminNav({ serviceName }: { serviceName: string }) {
  const pathname = usePathname();

  return (
    <header className="bg-navy text-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/admin" className="font-bold text-[15px] tracking-tight">
          {serviceName}
          <span className="ml-2 text-[11px] font-medium opacity-60">관리</span>
        </Link>
        <nav className="flex items-center gap-1 text-[13px]">
          {ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin" || pathname.startsWith("/admin/questions")
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  active ? "bg-navy-active" : "hover:bg-navy-active"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <form action={logout}>
            <button
              type="submit"
              className="px-2.5 py-1.5 rounded-md opacity-70 hover:opacity-100 hover:bg-navy-active transition-colors"
            >
              로그아웃
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
