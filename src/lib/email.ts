import "server-only";
import { Resend } from "resend";
import { formatDateTime, FIELD_LABELS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";

/**
 * HTML 이스케이프. 전신 A/S 앱은 사용자 입력을 그대로 보간해 인젝션 여지가 있었다.
 * 학생 입력은 물론 강사 답변에도 적용한다 — `<` 가 든 코드를 붙여넣으면 레이아웃이 깨진다.
 */
function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]!
  );
}

const WRAP = `font-family:'Pretendard','Malgun Gothic',sans-serif;max-width:560px;margin:0 auto;color:#1a2233`;
const BTN = `display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold`;
const BLOCK = `font-size:14px;background:#f1f4f9;border-radius:8px;padding:12px;white-space:pre-wrap;word-break:break-word`;

function labelRow(label: string, value: string) {
  return `<tr><td style="padding:6px 0;color:#6b7688;width:96px;vertical-align:top">${escapeHtml(
    label
  )}</td><td>${escapeHtml(value)}</td></tr>`;
}

/**
 * 개발 중에는 RESEND_API_KEY 가 비어 있어 메일이 나가지 않는다.
 * 설계상 개인 링크는 메일로만 전달하므로, 키가 없으면 터미널에 내용을 찍어
 * 링크를 확인할 수 있게 한다. 운영에서는 키가 있으므로 이 경로를 타지 않는다.
 */
function logToConsole(to: string[], subject: string, html: string) {
  const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  console.info(
    [
      "",
      "─".repeat(72),
      "[email] RESEND_API_KEY 가 없어 실제 발송을 건너뜁니다 (개발 모드)",
      `  받는 사람: ${to.join(", ")}`,
      `  제목:      ${subject}`,
      ...links.map((l) => `  링크:      ${l}`),
      "─".repeat(72),
      "",
    ].join("\n")
  );
}

async function send(to: string[], subject: string, html: string) {
  if (to.length === 0) return;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logToConsole(to, subject, html);
    return;
  }
  const settings = await getSettings();
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `${settings.serviceName} <${
        process.env.EMAIL_FROM ?? "onboarding@resend.dev"
      }>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    // 알림 실패가 본 동작(제출·답변 저장)을 막으면 안 됨
    console.error("[email] 발송 실패:", error);
  }
}

function instructorRecipients(notifyEmail: string | null) {
  return (notifyEmail ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

type NewQuestionInfo = {
  publicNo: string;
  questionId: string;
  submitterName: string;
  topicLabel: string;
  context: string;
  tried: string;
  problem: string;
  createdAt: Date;
  baseUrl: string;
};

/** 신규 질문 → 강사 */
export async function notifyInstructorNewQuestion(info: NewQuestionInfo) {
  const settings = await getSettings();
  const to = instructorRecipients(settings.notifyEmail);
  if (to.length === 0) return;

  const html = `
    <div style="${WRAP}">
      <h2 style="font-size:18px">새 질문이 접수되었습니다</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${labelRow("질문번호", info.publicNo)}
        ${labelRow("학생", info.submitterName)}
        ${labelRow("유형", info.topicLabel)}
        ${labelRow("접수일시", formatDateTime(info.createdAt))}
      </table>
      <p style="font-size:13px;color:#6b7688;margin:16px 0 4px">${escapeHtml(
        FIELD_LABELS.context
      )}</p>
      <div style="${BLOCK}">${escapeHtml(info.context)}</div>
      <p style="font-size:13px;color:#6b7688;margin:16px 0 4px">${escapeHtml(
        FIELD_LABELS.tried
      )}</p>
      <div style="${BLOCK}">${escapeHtml(info.tried)}</div>
      <p style="font-size:13px;color:#6b7688;margin:16px 0 4px">${escapeHtml(
        FIELD_LABELS.problem
      )}</p>
      <div style="${BLOCK}">${escapeHtml(info.problem)}</div>
      <p style="margin-top:20px">
        <a href="${info.baseUrl}/admin/questions/${
          info.questionId
        }" style="${BTN}">답변하러 가기</a>
      </p>
    </div>`;

  await send(
    to,
    `[새 질문] ${info.submitterName} — ${info.topicLabel} (${info.publicNo})`,
    html
  );
}

type AnsweredInfo = {
  email: string;
  studentName: string;
  publicNo: string;
  token: string;
  answer: string;
  baseUrl: string;
};

/** 답변 등록 → 학생 */
export async function notifyStudentAnswered(info: AnsweredInfo) {
  const html = `
    <div style="${WRAP}">
      <h2 style="font-size:18px">${escapeHtml(
        info.studentName
      )}님, 질문에 답변이 등록되었습니다</h2>
      <p style="font-size:14px;color:#6b7688">질문번호 ${escapeHtml(
        info.publicNo
      )}</p>
      <div style="${BLOCK}">${escapeHtml(info.answer.slice(0, 500))}${
        info.answer.length > 500 ? "…" : ""
      }</div>
      <p style="margin-top:20px">
        <a href="${info.baseUrl}/my/${info.token}/${encodeURIComponent(
          info.publicNo
        )}" style="${BTN}">전체 답변 보기</a>
      </p>
      <p style="font-size:12px;color:#6b7688;margin-top:24px">
        이 링크는 본인 확인 수단입니다. 다른 사람에게 공유하지 마세요.
      </p>
    </div>`;

  await send(
    [info.email],
    `[답변 도착] ${info.publicNo} 질문에 답변이 등록되었습니다`,
    html
  );
}

type MyLinkInfo = {
  email: string;
  studentName: string;
  token: string;
  baseUrl: string;
  /** submitted: 질문 제출 직후 / resend: 학생이 재발송 요청 */
  reason: "submitted" | "resend";
  publicNo?: string;
};

/**
 * 개인 링크 발송. 이 링크는 오직 이메일로만 전달한다 — 화면에 노출하면
 * 남의 이메일을 입력해 그 사람의 질문 전체를 열람할 수 있게 된다(PRD §2).
 */
export async function sendMyLink(info: MyLinkInfo) {
  const heading =
    info.reason === "submitted"
      ? "질문이 접수되었습니다"
      : "내 질문 확인 링크입니다";
  const sub =
    info.reason === "submitted" && info.publicNo
      ? `<p style="font-size:14px;color:#6b7688">질문번호 ${escapeHtml(
          info.publicNo
        )}</p>`
      : "";

  const html = `
    <div style="${WRAP}">
      <h2 style="font-size:18px">${escapeHtml(
        info.studentName
      )}님, ${heading}</h2>
      ${sub}
      <p style="font-size:14px">아래 링크에서 내가 보낸 질문과 답변을 확인할 수 있습니다. 답변이 등록되면 다시 메일로 알려드립니다.</p>
      <p style="margin-top:20px">
        <a href="${info.baseUrl}/my/${info.token}" style="${BTN}">내 질문 보기</a>
      </p>
      <p style="font-size:12px;color:#6b7688;margin-top:24px">
        이 링크는 본인 확인 수단입니다. 다른 사람에게 공유하지 마세요.<br />
        본인이 등록하지 않은 질문이 보인다면 강사에게 알려주세요.
      </p>
    </div>`;

  await send([info.email], `내 질문 확인 링크`, html);
}
