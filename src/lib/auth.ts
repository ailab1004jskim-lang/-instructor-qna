import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "qna_admin_session";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected)
  );
}

// 세션 토큰은 현재 비밀번호(해시 또는 환경변수)에 종속 →
// 비밀번호가 바뀌면 기존 세션 쿠키는 자동 무효화됨
async function secretBasis() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  return settings?.adminPasswordHash ?? process.env.ADMIN_PASSWORD ?? "";
}

function sessionTokenFor(basis: string) {
  return crypto
    .createHmac("sha256", process.env.SESSION_SECRET ?? "dev-secret")
    .update(`admin-session:${basis}`)
    .digest("hex");
}

async function setSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, sessionTokenFor(await secretBasis()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function isAdmin() {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return false;
  const expected = sessionTokenFor(await secretBasis());
  return (
    value.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected))
  );
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function checkAdminPassword(password: string) {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (settings?.adminPasswordHash) {
    return verifyPassword(password, settings.adminPasswordHash);
  }
  const envPassword = process.env.ADMIN_PASSWORD;
  return Boolean(envPassword) && password === envPassword;
}

export async function loginAdmin(password: string) {
  if (!(await checkAdminPassword(password))) return false;
  await setSessionCookie();
  return true;
}

export async function changeAdminPassword(newPassword: string) {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: { adminPasswordHash: hashPassword(newPassword) },
    create: { id: 1, adminPasswordHash: hashPassword(newPassword) },
  });
  // 새 비밀번호 기준으로 본인 세션 재발급 (다른 기기 세션은 무효화)
  await setSessionCookie();
}

export async function logoutAdmin() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
