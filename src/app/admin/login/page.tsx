import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const settings = await getSettings();

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="card p-7">
          <h1 className="text-lg font-bold text-center">
            {settings.serviceName}
          </h1>
          <p className="mt-1 mb-6 text-sm text-sub text-center">강사 로그인</p>
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-sub">
          <Link href="/" className="underline">
            질문 보내기 페이지로
          </Link>
        </p>
      </div>
    </main>
  );
}
