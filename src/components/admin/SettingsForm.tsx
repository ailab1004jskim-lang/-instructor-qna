"use client";

import { useActionState } from "react";
import { saveSettings, type ActionState } from "@/app/actions/admin";

const initial: ActionState = {};

export function SettingsForm({
  serviceName,
  notifyEmail,
}: {
  serviceName: string;
  notifyEmail: string;
}) {
  const [state, formAction, pending] = useActionState(saveSettings, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="serviceName" className="field-label">
          서비스명<span className="req">*</span>
        </label>
        <input
          id="serviceName"
          name="serviceName"
          className="field-input"
          defaultValue={serviceName}
          required
        />
        <p className="mt-1.5 text-xs text-sub">
          헤더와 이메일 발신명에 사용됩니다.
        </p>
      </div>

      <div>
        <label htmlFor="notifyEmail" className="field-label">
          알림 수신 이메일
        </label>
        <input
          id="notifyEmail"
          name="notifyEmail"
          className="field-input"
          defaultValue={notifyEmail}
          placeholder="teacher@example.com, assistant@example.com"
        />
        <p className="mt-1.5 text-xs text-sub">
          새 질문이 접수되면 이 주소로 알립니다. 쉼표로 여러 개 등록할 수
          있습니다. 비워두면 알림을 보내지 않습니다.
        </p>
      </div>

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
        {pending ? "저장 중…" : "저장"}
      </button>
    </form>
  );
}
