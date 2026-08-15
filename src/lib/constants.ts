/** 구조화 3필드의 최소 길이. 이 검증이 없으면 세 칸을 의미 없는 글자로 채워 장치가 무력화된다. */
export const MIN_LENGTHS = {
  name: 2,
  context: 5,
  tried: 10,
  problem: 10,
} as const;

export const MAX_LENGTHS = {
  name: 40,
  email: 120,
  context: 200,
  tried: 4000,
  problem: 4000,
  answer: 8000,
} as const;

/** 레이트리밋 (PRD §10①). 초과 시 저장 자체를 거부한다. */
export const RATE_LIMIT = {
  perIpPerHour: 5,
  perEmailPerDay: 10,
} as const;

export const FIELD_LABELS = {
  context: "어디서 막혔나요",
  tried: "어떻게 시도해봤나요",
  problem: "어떤 결과가 나왔나요 / 무엇이 이해 안 되나요",
} as const;

export const FIELD_HINTS = {
  context: "강의 회차 · 교재 페이지 · 문제 번호 등",
  tried: "직접 해본 방법을 순서대로 적어주세요.",
  problem: "화면에 나온 결과나 에러 메시지를 그대로 붙여넣어도 됩니다.",
} as const;

export const ANSWERED_BADGE = "badge bg-success-bg text-success";
export const PENDING_BADGE = "badge bg-warning-bg text-warning";

export function statusOf(answeredAt: Date | null) {
  return answeredAt
    ? { label: "답변완료", badgeClass: ANSWERED_BADGE }
    : { label: "대기", badgeClass: PENDING_BADGE };
}

export function formatDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDateTimeKorean(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${pad(
    date.getHours()
  )}시 ${pad(date.getMinutes())}분`;
}
