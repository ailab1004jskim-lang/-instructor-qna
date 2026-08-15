"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] 처리되지 않은 오류:", error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="card p-8 max-w-md w-full text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-danger-bg text-danger flex items-center justify-center text-2xl font-bold">
          !
        </div>
        <h1 className="mt-4 text-lg font-bold">문제가 발생했습니다</h1>
        <p className="mt-2 text-sm text-sub leading-relaxed">
          잠시 후 다시 시도해 주세요. 계속 같은 화면이 나오면 강사에게 알려
          주세요.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-sub">오류 번호 {error.digest}</p>
        ) : null}
        <button type="button" onClick={reset} className="btn-primary mt-6">
          다시 시도
        </button>
      </div>
    </main>
  );
}
