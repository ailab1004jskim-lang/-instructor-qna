import type { Metadata } from "next";

/**
 * 개인 링크는 검색엔진에 절대 노출되면 안 된다.
 * 학생이 링크를 어딘가에 붙여넣어 크롤러가 따라가는 경로를 차단한다.
 */
export const metadata: Metadata = {
  title: "내 질문",
  robots: { index: false, follow: false, nocache: true },
};

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
