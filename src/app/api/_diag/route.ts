import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 임시 진단 경로. 운영 환경에서 DB 접속이 실패하는 원인을 확인하기 위한 것이며
 * 확인 후 즉시 삭제한다.
 *
 * 자격증명이 새지 않도록 응답에서 연결 문자열·비밀번호를 제거한다.
 */
function redact(text: string) {
  return text
    .replace(/postgres(ql)?:\/\/[^\s"']+/gi, "postgresql://[REDACTED]")
    .replace(/npg_[A-Za-z0-9]+/g, "[REDACTED]");
}

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const direct = process.env.DIRECT_URL ?? "";

  // 값 자체는 노출하지 않고 형태만 검사한다 (따옴표·공백 혼입 여부 확인용)
  const shape = {
    DATABASE_URL: {
      present: url.length > 0,
      length: url.length,
      startsWithScheme: url.startsWith("postgresql://") || url.startsWith("postgres://"),
      firstChar: url.slice(0, 1),
      lastChar: url.slice(-1),
      hasQuote: url.includes('"') || url.includes("'"),
      hasWhitespace: /\s/.test(url),
      hasPooler: url.includes("-pooler"),
      host: (() => {
        try {
          return new URL(url).host;
        } catch (e) {
          return `URL 파싱 실패: ${(e as Error).message}`;
        }
      })(),
    },
    DIRECT_URL: {
      present: direct.length > 0,
      length: direct.length,
      hasQuote: direct.includes('"') || direct.includes("'"),
      hasPooler: direct.includes("-pooler"),
    },
    otherEnv: {
      RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
      SESSION_SECRET: Boolean(process.env.SESSION_SECRET),
      ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
    },
  };

  let dbResult: unknown;
  try {
    const { prisma } = await import("@/lib/prisma");
    const topics = await prisma.topic.count();
    dbResult = { ok: true, topics };
  } catch (error) {
    const e = error as Error & { code?: string; errorCode?: string };
    dbResult = {
      ok: false,
      name: e.name,
      code: e.code ?? e.errorCode ?? null,
      message: redact(String(e.message ?? "")).slice(0, 1200),
      stackHead: redact(String(e.stack ?? "")).split("\n").slice(0, 6).join("\n"),
    };
  }

  return NextResponse.json({ shape, dbResult }, { status: 200 });
}
