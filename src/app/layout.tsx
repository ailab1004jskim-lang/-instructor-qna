import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "강사 질문방",
    template: "%s · 강사 질문방",
  },
  description: "수강생이 강사에게 질문을 남기고 답변을 확인하는 창구",
};

export const viewport: Viewport = {
  themeColor: "#111c30",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
