"use client";

import { useActionState } from "react";
import { saveAnswer, type ActionState } from "@/app/actions/admin";

const initial: ActionState = {};

export function AnswerForm({
  questionId,
  defaultValue,
  alreadyAnswered,
}: {
  questionId: string;
  defaultValue: string;
  alreadyAnswered: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveAnswer, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="questionId" value={questionId} />
      <textarea
        name="answer"
        className="field-textarea min-h-48 font-mono text-[13px]"
        defaultValue={defaultValue}
        required
        maxLength={8000}
        placeholder="답변을 작성하세요. 줄바꿈은 그대로 학생에게 보입니다."
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="notify"
          defaultChecked={!alreadyAnswered}
          className="w-4 h-4 accent-[var(--color-primary)]"
        />
        학생에게 이메일로 알림 보내기
        {alreadyAnswered ? (
          <span className="text-xs text-sub">(수정 시 기본 해제)</span>
        ) : null}
      </label>

      {state.error ? (
        <p
          role="alert"
          className="text-sm text-danger bg-danger-bg rounded-lg px-3.5 py-2.5"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-success bg-success-bg rounded-lg px-3.5 py-2.5">
          저장했습니다.
        </p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "저장 중…" : alreadyAnswered ? "답변 수정" : "답변 등록"}
      </button>
    </form>
  );
}
