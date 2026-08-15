"use client";

import { useActionState } from "react";
import { requestMyLink, type LinkRequestState } from "@/app/actions/questions";

const initial: LinkRequestState = {};

export function LinkRequestForm() {
  const [state, formAction, pending] = useActionState(requestMyLink, initial);

  if (state.sent) {
    return (
      <div className="rounded-lg bg-success-bg px-4 py-4 text-center">
        <p className="text-sm font-semibold text-success">메일을 보냈습니다.</p>
        <p className="mt-1.5 text-[13px] text-sub leading-relaxed">
          받은편지함에서 <strong>내 질문 확인 링크</strong>를 확인해 주세요.
          <br />
          몇 분 내로 오지 않으면 스팸함도 확인해 보세요.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="field-label">
          질문할 때 입력한 이메일<span className="req">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="field-input"
          required
          autoComplete="email"
          placeholder="student@example.com"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="text-sm text-danger bg-danger-bg rounded-lg px-3.5 py-2.5"
        >
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "보내는 중…" : "확인 링크 받기"}
      </button>
    </form>
  );
}
