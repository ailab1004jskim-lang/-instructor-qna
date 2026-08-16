/**
 * 환경변수를 읽되, 빈 문자열·공백만 있는 값은 "설정되지 않음"으로 취급한다.
 *
 * `process.env.X ?? fallback` 은 X 가 "" 일 때 fallback 을 쓰지 않는다.
 * 배포 플랫폼에서 변수를 만들어두고 값을 비워두는 일이 흔해, 이 차이가
 * 실제로 발신 주소가 비어 발송이 전부 거부되는 장애로 이어졌다.
 */
export function envOr(name: string, fallback: string): string {
  const value = process.env[name];
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/** 값이 실제로 설정돼 있는지 (빈 문자열은 미설정으로 본다) */
export function hasEnv(name: string): boolean {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}
