"use client";

import { useActionState, useState } from "react";
import { createQuestion, type CreateQuestionState } from "@/app/actions/questions";
import { FIELD_LABELS, FIELD_HINTS, MIN_LENGTHS } from "@/lib/constants";

type TopicOption = { id: string; label: string; hint: string | null };

const initial: CreateQuestionState = {};

export function QuestionForm({ topics }: { topics: TopicOption[] }) {
  const [state, formAction, pending] = useActionState(createQuestion, initial);
  const [topicId, setTopicId] = useState("");
  const selected = topics.find((t) => t.id === topicId);

  return (
    <form action={formAction} className="space-y-5">
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
      <p className="-mt-2 text-xs text-sub">
        답변이 등록되면 이 주소로 알려드립니다. 주소를 한 번 더 확인해 주세요.
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

      <div>
        <label htmlFor="context" className="field-label">
          {FIELD_LABELS.context}
          <span className="req">*</span>
        </label>
        <input
          id="context"
          name="context"
          className="field-input"
          required
          minLength={MIN_LENGTHS.context}
          maxLength={200}
          placeholder="예) 3주차 강의 후반부, 교재 82쪽 예제 2번"
        />
        <p className="mt-1.5 text-xs text-sub">{FIELD_HINTS.context}</p>
      </div>

      <div>
        <label htmlFor="tried" className="field-label">
          {FIELD_LABELS.tried}
          <span className="req">*</span>
        </label>
        <textarea
          id="tried"
          name="tried"
          className="field-textarea"
          required
          minLength={MIN_LENGTHS.tried}
          maxLength={4000}
          placeholder={"예)\n1. 강의에서 알려주신 순서대로 따라 했습니다.\n2. 교재 80쪽 방식으로도 다시 해봤습니다."}
        />
        <p className="mt-1.5 text-xs text-sub">{FIELD_HINTS.tried}</p>
      </div>

      <div>
        <label htmlFor="problem" className="field-label">
          {FIELD_LABELS.problem}
          <span className="req">*</span>
        </label>
        <textarea
          id="problem"
          name="problem"
          className="field-textarea"
          required
          minLength={MIN_LENGTHS.problem}
          maxLength={4000}
          placeholder={"예) 두 번째 단계에서 결과가 나오지 않고 아래 메시지가 떴습니다.\n(메시지를 그대로 붙여넣어 주세요)"}
        />
        <p className="mt-1.5 text-xs text-sub">{FIELD_HINTS.problem}</p>
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
        {pending ? "접수 중…" : "질문 보내기"}
      </button>
    </form>
  );
}
