import "server-only";
import { headers } from "next/headers";

/**
 * 클라이언트 IP. 레이트리밋(PRD §10①)의 판정 키.
 * x-forwarded-for 는 프록시 체인이 쉼표로 이어지므로 첫 항목을 취한다.
 * 배포처마다 헤더가 다를 수 있어 x-real-ip 로 폴백한다.
 */
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? null;
}

/** 이메일 본문에 넣을 절대 URL. 환경변수가 있으면 우선한다. */
export async function getBaseUrl(): Promise<string> {
  const configured = process.env.APP_BASE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
