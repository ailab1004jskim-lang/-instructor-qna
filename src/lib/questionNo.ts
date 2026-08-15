import "server-only";
import { prisma } from "@/lib/prisma";

// 혼동 문자(0/O, 1/I/L) 제외
const SUFFIX_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomSuffix(length = 3) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SUFFIX_CHARS[Math.floor(Math.random() * SUFFIX_CHARS.length)];
  }
  return out;
}

/**
 * Q-YYYY-NNNN-XXX
 *
 * 순번은 Counter 테이블의 원자적 증가로 얻는다. count() 기반이면 질문 삭제 시
 * 번호가 재사용되고 동시 제출에서 경합이 나므로 쓰지 않는다.
 * 순번이 유일하므로 publicNo 전체가 유일하다 → 충돌 재시도 루프 불필요.
 */
export async function generateQuestionNo(): Promise<string> {
  const year = new Date().getFullYear();
  const { value } = await prisma.counter.upsert({
    where: { year },
    update: { value: { increment: 1 } },
    create: { year, value: 1 },
  });
  return `Q-${year}-${String(value).padStart(4, "0")}-${randomSuffix()}`;
}
