import Link from "next/link";
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
      {/*
        강사 로그인 입구는 푸터에 둔다.
        상단 메뉴는 학생 전원이 매번 보는 자리인데, 이 링크를 쓰는 사람은 강사 한 명뿐이다.
        게다가 "관리자"는 학생에게 문의처로 읽혀 오해를 만든다.
      */}
      <footer className="px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sub">
          <p className="text-center sm:text-left">
            질문 내용과 연락 정보는 답변 목적에만 사용됩니다.
          </p>
          <Link
            href="/admin"
            className="text-sub/70 hover:text-primary transition-colors whitespace-nowrap"
          >
            강사 로그인
          </Link>
        </div>
      </footer>
    </>
  );
}
