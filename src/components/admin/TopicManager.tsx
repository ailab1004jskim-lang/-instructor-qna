"use client";

import { useActionState, useState } from "react";
import {
  createTopic,
  renameTopic,
  toggleTopic,
  type ActionState,
} from "@/app/actions/admin";

type Topic = {
  id: string;
  label: string;
  hint: string | null;
  active: boolean;
  _count: { questions: number };
};

const initial: ActionState = {};

function CreateRow() {
  const [state, formAction, pending] = useActionState(createTopic, initial);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="new-label" className="field-label">
            유형 이름<span className="req">*</span>
          </label>
          <input
            id="new-label"
            name="label"
            className="field-input"
            required
            placeholder="예) 과제"
          />
        </div>
        <div>
          <label htmlFor="new-hint" className="field-label">
            안내 문구
          </label>
          <input
            id="new-hint"
            name="hint"
            className="field-input"
            placeholder="선택 시 학생에게 보이는 설명"
          />
        </div>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "추가 중…" : "유형 추가"}
      </button>
    </form>
  );
}

function EditRow({ topic }: { topic: Topic }) {
  const [state, formAction, pending] = useActionState(renameTopic, initial);
  const [editing, setEditing] = useState(false);

  return (
    <li className="px-4 py-3.5">
      {editing ? (
        <form action={formAction} className="space-y-2.5">
          <input type="hidden" name="id" value={topic.id} />
          <input
            name="label"
            className="field-input"
            defaultValue={topic.label}
            required
          />
          <input
            name="hint"
            className="field-input"
            defaultValue={topic.hint ?? ""}
            placeholder="안내 문구"
          />
          {state.error ? (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn-primary h-9 px-4 text-sm"
              disabled={pending}
            >
              저장
            </button>
            <button
              type="button"
              className="btn-secondary h-9 px-4 text-sm"
              onClick={() => setEditing(false)}
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-40">
            <p className="text-sm font-semibold">
              {topic.label}
              {!topic.active ? (
                <span className="ml-2 badge bg-bg text-sub">비활성</span>
              ) : null}
            </p>
            {topic.hint ? (
              <p className="mt-0.5 text-xs text-sub">{topic.hint}</p>
            ) : null}
          </div>
          <span className="text-xs text-sub">
            질문 {topic._count.questions}건
          </span>
          <button
            type="button"
            className="btn-secondary h-9 px-3 text-sm"
            onClick={() => setEditing(true)}
          >
            수정
          </button>
          <form action={toggleTopic}>
            <input type="hidden" name="id" value={topic.id} />
            <button type="submit" className="btn-secondary h-9 px-3 text-sm">
              {topic.active ? "비활성화" : "활성화"}
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

export function TopicManager({ topics }: { topics: Topic[] }) {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="text-sm font-bold mb-4">유형 추가</h2>
        <CreateRow />
      </div>

      <div className="card overflow-hidden">
        <ul className="divide-y divide-line">
          {topics.map((topic) => (
            <EditRow key={topic.id} topic={topic} />
          ))}
        </ul>
      </div>

      <p className="text-xs text-sub">
        이미 등록된 질문이 참조하므로 유형은 삭제할 수 없습니다. 비활성화하면
        제출 폼 목록에서만 사라집니다.
      </p>
    </div>
  );
}
