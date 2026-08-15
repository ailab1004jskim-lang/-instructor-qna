import "server-only";
import { prisma } from "@/lib/prisma";
import { RATE_LIMIT } from "@/lib/constants";

export type RateLimitResult = { ok: true } | { ok: false; reason: string };

/**
 * 접근 제한을 두지 않기로 한 결정(PRD §10①)의 유일한 완화책.
 * 초과 시 저장 자체를 거부한다 — 저장 후 표시만 막으면 DB와 강사 알림 메일이 그대로 오염된다.
 */
export async function checkSubmitRateLimit(
  ip: string | null,
  email: string
): Promise<RateLimitResult> {
  const now = Date.now();

  if (ip) {
    const hourAgo = new Date(now - 60 * 60 * 1000);
    const recentFromIp = await prisma.question.count({
      where: { submitterIp: ip, createdAt: { gte: hourAgo } },
    });
    if (recentFromIp >= RATE_LIMIT.perIpPerHour) {
      return {
        ok: false,
        reason: `짧은 시간에 너무 많이 제출했습니다. 1시간 뒤에 다시 시도해 주세요.`,
      };
    }
  }

  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const recentFromEmail = await prisma.question.count({
    where: {
      student: { email },
      createdAt: { gte: dayAgo },
    },
  });
  if (recentFromEmail >= RATE_LIMIT.perEmailPerDay) {
    return {
      ok: false,
      reason: `하루에 등록할 수 있는 질문 수(${RATE_LIMIT.perEmailPerDay}건)를 넘었습니다. 내일 다시 시도해 주세요.`,
    };
  }

  return { ok: true };
}
