import Link from "next/link";
import { getSettings } from "@/lib/settings";

export async function PublicHeader() {
  const settings = await getSettings();
  return (
    <header className="bg-navy text-white">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-[15px] tracking-tight">
          {settings.serviceName}
        </Link>
        <nav className="flex items-center gap-1 text-[13px]">
          <Link
            href="/"
            className="px-2.5 py-1.5 rounded-md hover:bg-navy-active transition-colors"
          >
            질문하기
          </Link>
          <Link
            href="/link"
            className="px-2.5 py-1.5 rounded-md hover:bg-navy-active transition-colors"
          >
            내 질문 찾기
          </Link>
        </nav>
      </div>
    </header>
  );
}
