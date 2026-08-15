import { PublicHeader } from "@/components/PublicHeader";

// 헤더가 서비스명을 DB에서 읽으므로 이 하위 라우트는 전부 요청 시 렌더링한다.
export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      <main className="flex-1 px-4 py-6 md:py-10">{children}</main>
      <footer className="px-4 py-6 text-center text-xs text-sub">
        질문 내용과 연락 정보는 답변 목적에만 사용됩니다.
      </footer>
    </>
  );
}
