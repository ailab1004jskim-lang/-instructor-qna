"use client";

import { useState } from "react";
import { deleteQuestion } from "@/app/actions/admin";

/**
 * 스팸·오제출 정리용. 접근 제한을 두지 않기로 한 결정의 필연적 귀결이라
 * v1 필수 기능이다 (PRD §3.3).
 * 브라우저 confirm() 대신 인라인 2단계 확인을 쓴다.
 */
export function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="text-xs text-sub hover:text-danger underline transition-colors"
      >
        이 질문 삭제
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-danger font-medium">
        삭제하면 되돌릴 수 없습니다.
      </span>
      <form action={deleteQuestion}>
        <input type="hidden" name="questionId" value={questionId} />
        <button type="submit" className="btn-danger h-8 px-3 text-xs">
          삭제 확정
        </button>
      </form>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="text-xs text-sub underline"
      >
        취소
      </button>
    </div>
  );
}
