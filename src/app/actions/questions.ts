"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateQuestionNo } from "@/lib/questionNo";
import { upsertStudent, normalizeEmail } from "@/lib/student";
import { checkSubmitRateLimit } from "@/lib/rateLimit";
import { getClientIp, getBaseUrl } from "@/lib/request";
import { notifyInstructorNewQuestion, sendMyLink } from "@/lib/email";
import { MIN_LENGTHS, MAX_LENGTHS, FIELD_LABELS } from "@/lib/constants";

export type CreateQuestionState = { error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createQuestion(
  _prev: CreateQuestionState,
  formData: FormData
): Promise<CreateQuestionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const topicId = String(formData.get("topicId") ?? "");
  const context = String(formData.get("context") ?? "").trim();
  const tried = String(formData.get("tried") ?? "").trim();
  const problem = String(formData.get("problem") ?? "").trim();

  if (name.length < MIN_LENGTHS.name) return { error: "성명을 입력해 주세요." };
  if (name.length > MAX_LENGTHS.name)
    return { error: "성명이 너무 깁니다." };
  if (!EMAIL_RE.test(email) || email.length > MAX_LENGTHS.email)
    return { error: "이메일 주소를 정확히 입력해 주세요." };
  if (!topicId) return { error: "질문 유형을 선택해 주세요." };

  // 구조화 3필드는 최소 길이를 강제한다. 없으면 장치 자체가 무력화된다.
  if (context.length < MIN_LENGTHS.context)
    return {
      error: `'${FIELD_LABELS.context}'를 ${MIN_LENGTHS.context}자 이상 입력해 주세요.`,
    };
  if (tried.length < MIN_LENGTHS.tried)
    return {
      error: `'${FIELD_LABELS.tried}'를 ${MIN_LENGTHS.tried}자 이상 입력해 주세요.`,
    };
  if (problem.length < MIN_LENGTHS.problem)
    return {
      error: `'${FIELD_LABELS.problem}'를 ${MIN_LENGTHS.problem}자 이상 입력해 주세요.`,
    };
  if (
    context.length > MAX_LENGTHS.context ||
    tried.length > MAX_LENGTHS.tried ||
    problem.length > MAX_LENGTHS.problem
  )
    return { error: "입력이 너무 깁니다. 내용을 줄여 주세요." };

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic || !topic.active)
    return { error: "선택한 질문 유형을 찾을 수 없습니다. 다시 선택해 주세요." };

  const ip = await getClientIp();
  const limit = await checkSubmitRateLimit(ip, email);
  if (!limit.ok) return { error: limit.reason };

  let publicNo = "";
  let questionId = "";
  let token = "";
  try {
    const student = await upsertStudent(email, name);
    token = student.token;
    publicNo = await generateQuestionNo();
    const created = await prisma.question.create({
      data: {
        publicNo,
        studentId: student.id,
        topicId: topic.id,
        submitterName: name,
        context,
        tried,
        problem,
        submitterIp: ip,
      },
    });
    questionId = created.id;
  } catch (error) {
    console.error("[questions] 접수 실패:", error);
    return {
      error: "접수 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  const baseUrl = await getBaseUrl();
  const createdAt = new Date();

  // 개인 링크는 이메일로만 전달한다 (PRD §2). 완료 화면에는 노출하지 않는다.
  await sendMyLink({
    email,
    studentName: name,
    token,
    baseUrl,
    reason: "submitted",
    publicNo,
  });
  await notifyInstructorNewQuestion({
    publicNo,
    questionId,
    submitterName: name,
    topicLabel: topic.label,
    context,
    tried,
    problem,
    createdAt,
    baseUrl,
  });

  redirect(`/submitted/${encodeURIComponent(publicNo)}`);
}

export type LinkRequestState = { error?: string; sent?: boolean };

/**
 * 개인 링크 재발송.
 * 등록되지 않은 이메일이라도 동일한 응답을 돌려준다 — 응답이 달라지면
 * 특정 주소의 가입 여부를 확인하는 도구가 된다.
 */
export async function requestMyLink(
  _prev: LinkRequestState,
  formData: FormData
): Promise<LinkRequestState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!EMAIL_RE.test(email))
    return { error: "이메일 주소를 정확히 입력해 주세요." };

  const student = await prisma.student.findUnique({ where: { email } });
  if (student) {
    await sendMyLink({
      email: student.email,
      studentName: student.name,
      token: student.token,
      baseUrl: await getBaseUrl(),
      reason: "resend",
    });
  }
  return { sent: true };
}
