import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="card p-8 max-w-md w-full text-center">
        <p className="text-4xl font-bold text-line">404</p>
        <h1 className="mt-3 text-lg font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-sub leading-relaxed">
          주소가 잘못되었거나, 더 이상 유효하지 않은 링크입니다.
          <br />
          내 질문을 확인하려면 아래에서 링크를 다시 받아보세요.
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Link href="/link" className="btn-secondary">
            내 질문 링크 받기
          </Link>
          <Link href="/" className="btn-primary">
            질문 보내기
          </Link>
        </div>
      </div>
    </main>
  );
}
