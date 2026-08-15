"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  isAdmin,
  loginAdmin,
  logoutAdmin,
  checkAdminPassword,
  changeAdminPassword,
} from "@/lib/auth";
import { getBaseUrl } from "@/lib/request";
import { notifyStudentAnswered } from "@/lib/email";
import { MAX_LENGTHS } from "@/lib/constants";

// Server Action 은 UI 를 거치지 않은 직접 POST 로도 호출 가능하므로
// 모든 관리 액션은 진입 즉시 권한을 확인한다.
async function assertAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export type ActionState = { error?: string; success?: boolean };

export async function login(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!(await loginAdmin(password))) {
    return { error: "비밀번호가 올바르지 않습니다." };
  }
  redirect("/admin");
}

export async function logout() {
  await logoutAdmin();
  redirect("/admin/login");
}

export async function saveAnswer(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAdmin();
  const questionId = String(formData.get("questionId") ?? "");
  const answer = String(formData.get("answer") ?? "").trim();
  const notify = formData.get("notify") === "on";
  if (!questionId) return { error: "잘못된 요청입니다." };
  if (!answer) return { error: "답변 내용을 입력해 주세요." };
  if (answer.length > MAX_LENGTHS.answer)
    return { error: "답변이 너무 깁니다." };

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { student: true },
  });
  if (!question) return { error: "질문을 찾을 수 없습니다." };

  await prisma.question.update({
    where: { id: questionId },
    data: { answer, answeredAt: question.answeredAt ?? new Date() },
  });

  if (notify) {
    await notifyStudentAnswered({
      email: question.student.email,
      studentName: question.student.name,
      publicNo: question.publicNo,
      token: question.student.token,
      answer,
      baseUrl: await getBaseUrl(),
    });
  }

  revalidatePath(`/admin/questions/${questionId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteQuestion(formData: FormData) {
  await assertAdmin();
  const questionId = String(formData.get("questionId") ?? "");
  if (!questionId) return;
  await prisma.question.delete({ where: { id: questionId } });
  // Counter 는 되돌리지 않는다 → 질문번호 재사용 없음
  revalidatePath("/admin");
  redirect("/admin");
}

export async function createTopic(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAdmin();
  const label = String(formData.get("label") ?? "").trim();
  const hint = String(formData.get("hint") ?? "").trim();
  if (!label) return { error: "유형 이름을 입력해 주세요." };
  await prisma.topic.create({ data: { label, hint: hint || null } });
  revalidatePath("/admin/topics");
  revalidatePath("/");
  return { success: true };
}

export async function renameTopic(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const hint = String(formData.get("hint") ?? "").trim();
  if (!id || !label) return { error: "유형 이름을 입력해 주세요." };
  await prisma.topic.update({
    where: { id },
    data: { label, hint: hint || null },
  });
  revalidatePath("/admin/topics");
  revalidatePath("/");
  return { success: true };
}

export async function toggleTopic(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) return;
  await prisma.topic.update({
    where: { id },
    data: { active: !topic.active },
  });
  revalidatePath("/admin/topics");
  revalidatePath("/");
}

export async function updateAdminPassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAdmin();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!(await checkAdminPassword(currentPassword)))
    return { error: "현재 비밀번호가 올바르지 않습니다." };
  if (newPassword.length < 8)
    return { error: "새 비밀번호는 8자 이상이어야 합니다." };
  if (newPassword !== confirmPassword)
    return { error: "새 비밀번호가 서로 일치하지 않습니다." };

  await changeAdminPassword(newPassword);
  return { success: true };
}

export async function saveSettings(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAdmin();
  const serviceName = String(formData.get("serviceName") ?? "").trim();
  const notifyEmailRaw = String(formData.get("notifyEmail") ?? "").trim();
  if (!serviceName) return { error: "서비스명을 입력해 주세요." };
  const emails = notifyEmailRaw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (emails.some((e) => !/^\S+@\S+\.\S+$/.test(e)))
    return { error: "알림 이메일 형식이 올바르지 않습니다." };
  await prisma.settings.upsert({
    where: { id: 1 },
    update: { serviceName, notifyEmail: emails.join(", ") || null },
    create: {
      id: 1,
      serviceName,
      notifyEmail: emails.join(", ") || null,
    },
  });
  revalidatePath("/", "layout");
  return { success: true };
}
