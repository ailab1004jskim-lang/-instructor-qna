"use client";

import { useActionState, useState } from "react";
import {
  createQuestion,
  type CreateQuestionState,
} from "@/app/actions/questions";
import { FIELD_LABELS, FIELD_HINTS, MIN_LENGTHS } from "@/lib/constants";

type TopicOption = { id: string; label: string; hint: string | null };

const initial: CreateQuestionState = {};

/**
 * 3필드를 번호가 붙은 단계로 보여준다.
 * 자유서술 한 칸을 셋으로 쪼갠 것이 이 앱의 핵심 장치인데, 화면에서 그냥
 * 입력칸 세 개로 보이면 학생은 "왜 이렇게 많이 쓰라는 거지"로만 받아들인다.
 */
function Step({
  n,
  label,
  hint,
  children,
}: {
  n: number;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-0.5">
        <span className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
          {n}
        </span>
        <span className="flex-1 w-px bg-line mt-1.5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0 pb-5">
        <p className="text-sm font-semibold leading-6">
          {label}
          <span className="req">*</span>
        </p>
        <p className="mt-0.5 mb-2 text-xs text-sub">{hint}</p>
        {children}
      </div>
    </div>
  );
}

export function QuestionForm({ topics }: { topics: TopicOption[] }) {
  const [state, formAction, pending] = useActionState(createQuestion, initial);
  const [topicId, setTopicId] = useState("");
  const selected = topics.find((t) => t.id === topicId);

  return (
    <form action={formAction} className="space-y-6">
      {/* 신원 */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="field-label">
              성명<span className="req">*</span>
            </label>
            <input
              id="name"
              name="name"
              className="field-input"
              required
              minLength={MIN_LENGTHS.name}
              maxLength={40}
              autoComplete="name"
              placeholder="홍길동"
            />
          </div>
          <div>
            <label htmlFor="email" className="field-label">
              이메일<span className="req">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="field-input"
              required
              maxLength={120}
              autoComplete="email"
              placeholder="student@example.com"
            />
          </div>
        </div>
        <p className="flex gap-2 text-xs text-sub bg-info-bg rounded-lg px-3.5 py-2.5">
          <span aria-hidden="true">✉</span>
          <span>
            답변이 등록되면 이 주소로 알려드립니다. 답변을 확인하는 링크도 이
            주소로만 보내니 한 번 더 확인해 주세요.
          </span>
        </p>

        <div>
          <label htmlFor="topicId" className="field-label">
            질문 유형<span className="req">*</span>
          </label>
          <select
            id="topicId"
            name="topicId"
            className="field-input"
            required
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
          >
            <option value="">선택해 주세요</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {selected?.hint ? (
            <p className="mt-1.5 text-xs text-sub">{selected.hint}</p>
          ) : null}
        </div>
      </section>

      {/* 구조화 3필드 */}
      <section className="border-t border-line pt-5">
        <p className="text-sm font-semibold">질문 내용</p>
        <p className="mt-1 mb-5 text-xs text-sub leading-relaxed">
          아래 세 가지를 나눠서 적어주시면 되묻지 않고 한 번에 답을 드릴 수
          있습니다.
        </p>

        <Step n={1} label={FIELD_LABELS.context} hint={FIELD_HINTS.context}>
          <input
            id="context"
            name="context"
            className="field-input"
            required
            minLength={MIN_LENGTHS.context}
            maxLength={200}
            placeholder="예) 3주차 강의 후반부, 교재 82쪽 예제 2번"
          />
        </Step>

        <Step n={2} label={FIELD_LABELS.tried} hint={FIELD_HINTS.tried}>
          <textarea
            id="tried"
            name="tried"
            className="field-textarea"
            required
            minLength={MIN_LENGTHS.tried}
            maxLength={4000}
            placeholder={
              "예)\n1. 강의에서 알려주신 순서대로 따라 했습니다.\n2. 교재 80쪽 방식으로도 다시 해봤습니다."
            }
          />
        </Step>

        <div className="flex gap-3">
          <div className="flex flex-col items-center pt-0.5">
            <span className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              3
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-6">
              {FIELD_LABELS.problem}
              <span className="req">*</span>
            </p>
            <p className="mt-0.5 mb-2 text-xs text-sub">
              {FIELD_HINTS.problem}
            </p>
            <textarea
              id="problem"
              name="problem"
              className="field-textarea font-mono text-[13px]"
              required
              minLength={MIN_LENGTHS.problem}
              maxLength={4000}
              placeholder={
                "예) 두 번째 단계에서 결과가 나오지 않고 아래 메시지가 떴습니다.\n(메시지를 그대로 붙여넣어 주세요)"
              }
            />
            <p className="mt-1.5 text-xs text-sub">
              줄바꿈은 그대로 유지되니 화면 내용을 그대로 붙여넣으셔도 됩니다.
            </p>
          </div>
        </div>
      </section>

      {state.error ? (
        <p
          role="alert"
          className="text-sm text-danger bg-danger-bg rounded-lg px-3.5 py-2.5"
        >
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "접수 중…" : "질문 보내기"}
      </button>
    </form>
  );
}
