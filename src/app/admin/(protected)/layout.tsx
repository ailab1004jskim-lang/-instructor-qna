import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리",
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <>
      <AdminNav serviceName={settings.serviceName} />
      <main className="flex-1 px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </>
  );
}
