import "server-only";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export function newStudentToken() {
  return crypto.randomBytes(16).toString("hex"); // 32 hex
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * 이메일 기준 upsert. name 은 최근 제출 값으로 갱신하되, 과거 질문의 당시 이름은
 * Question.submitterName 스냅샷에 남으므로 소실되지 않는다.
 */
export async function upsertStudent(email: string, name: string) {
  const normalized = normalizeEmail(email);
  return prisma.student.upsert({
    where: { email: normalized },
    update: { name },
    create: { email: normalized, name, token: newStudentToken() },
  });
}

/** 개인 링크 토큰으로 학생을 찾는다. 형식이 어긋나면 DB를 건드리지 않는다. */
export async function findStudentByToken(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  return prisma.student.findUnique({ where: { token } });
}

export function myLinkPath(token: string) {
  return `/my/${token}`;
}
