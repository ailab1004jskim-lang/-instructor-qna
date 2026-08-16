import "server-only";
import { prisma } from "@/lib/prisma";
import { RATE_LIMIT, LOGIN_LIMIT } from "@/lib/constants";

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

/**
 * 관리자 로그인 시도 제한.
 *
 * 로그인 입구를 푸터에 노출하므로 무제한 비밀번호 대입을 막아야 한다.
 * 서버리스에서는 요청마다 인스턴스가 달라져 메모리 카운터를 쓸 수 없어 DB에 기록한다.
 */
export async function checkLoginRateLimit(
  ip: string | null
): Promise<RateLimitResult> {
  const key = ip ?? "unknown";
  const since = new Date(Date.now() - LOGIN_LIMIT.windowMinutes * 60 * 1000);

  const failures = await prisma.loginAttempt.count({
    where: { ip: key, success: false, createdAt: { gte: since } },
  });

  if (failures >= LOGIN_LIMIT.maxFailures) {
    return {
      ok: false,
      reason: `로그인 시도가 너무 많습니다. ${LOGIN_LIMIT.windowMinutes}분 후에 다시 시도해 주세요.`,
    };
  }
  return { ok: true };
}

/** 시도 결과를 남긴다. 성공하면 해당 IP의 실패 기록을 지워 즉시 초기화한다. */
export async function recordLoginAttempt(ip: string | null, success: boolean) {
  const key = ip ?? "unknown";
  try {
    await prisma.loginAttempt.create({ data: { ip: key, success } });

    if (success) {
      await prisma.loginAttempt.deleteMany({ where: { ip: key, success: false } });
    }

    // 오래된 기록 정리 (별도 스케줄러 없이 이 경로에서 처리)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: cutoff } } });
  } catch (error) {
    // 기록 실패가 로그인 자체를 막으면 안 됨
    console.error("[login] 시도 기록 실패:", error);
  }
}
