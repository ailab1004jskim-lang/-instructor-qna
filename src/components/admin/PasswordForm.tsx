"use client";

import { useActionState } from "react";
import { updateAdminPassword, type ActionState } from "@/app/actions/admin";

const initial: ActionState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    updateAdminPassword,
    initial
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="field-label">
          현재 비밀번호
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          className="field-input"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="newPassword" className="field-label">
            새 비밀번호 (8자 이상)
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            className="field-input"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="field-label">
            새 비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="field-input"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
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
          비밀번호를 변경했습니다. 다른 기기의 로그인은 모두 해제되었습니다.
        </p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "변경 중…" : "비밀번호 변경"}
      </button>
    </form>
  );
}
