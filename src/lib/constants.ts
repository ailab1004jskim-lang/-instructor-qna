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

/**
 * 관리자 로그인 시도 제한.
 * 로그인 입구를 화면에 노출하는 이상, 무제한 대입을 막는 최소 방어가 필요하다.
 */
export const LOGIN_LIMIT = {
  maxFailures: 5,
  windowMinutes: 15,
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

/**
 * 표시 시각은 한국 시간으로 고정한다.
 * 서버의 로컬 시간에 의존하면 배포 환경(UTC)에서 9시간 어긋난 값이 나온다.
 * getHours() 같은 로컬 기준 메서드를 여기 밖에서 쓰지 말 것.
 */
const KST = "Asia/Seoul";

function kstParts(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function formatDateTime(d: Date | string) {
  const { year, month, day, hour, minute } = kstParts(d);
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

export function formatDateTimeKorean(d: Date | string) {
  const { year, month, day, hour, minute } = kstParts(d);
  return `${year}년 ${Number(month)}월 ${Number(day)}일 ${hour}시 ${minute}분`;
}
