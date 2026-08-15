"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/app/actions/admin";

const initial: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="field-label">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="field-input"
          required
          autoComplete="current-password"
          autoFocus
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
        {pending ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
