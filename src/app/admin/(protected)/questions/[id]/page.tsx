import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Field } from "@/components/Prose";
import { AnswerForm } from "@/components/admin/AnswerForm";
import { DeleteQuestionButton } from "@/components/admin/DeleteQuestionButton";
import {
  formatDateTime,
  statusOf,
  FIELD_LABELS,
  FIELD_HINTS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminQuestionDetailPage({
  params,
}: PageProps<"/admin/questions/[id]">) {
  const { id } = await params;

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      topic: { select: { label: true } },
      student: { select: { email: true, name: true } },
    },
  });
  if (!question) notFound();

  const status = statusOf(question.answeredAt);
  const history = await prisma.question.count({
    where: { studentId: question.studentId },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link href="/admin" className="text-sm text-sub hover:text-ink">
          ← 목록으로
        </Link>
        <DeleteQuestionButton questionId={question.id} />
      </div>

      <div className="card p-5 md:p-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={status.badgeClass}>{status.label}</span>
          <span className="text-sm font-bold">{question.submitterName}</span>
          <span className="text-xs text-sub">{question.student.email}</span>
          <span className="ml-auto text-xs text-sub tracking-wide">
            {question.publicNo}
          </span>
        </div>
        <p className="mt-2 text-xs text-sub">
          {question.topic.label} · 접수 {formatDateTime(question.createdAt)} ·
          이 학생의 누적 질문 {history}건
        </p>

        <div className="mt-6 space-y-4">
          <Field
            label={FIELD_LABELS.context}
            hint={FIELD_HINTS.context}
            value={question.context}
          />
          <Field label={FIELD_LABELS.tried} value={question.tried} />
          <Field label={FIELD_LABELS.problem} value={question.problem} />
        </div>
      </div>

      <div className="card p-5 md:p-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold">답변</h2>
          {question.answeredAt ? (
            <span className="text-xs text-sub">
              등록 {formatDateTime(question.answeredAt)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 mb-4 text-xs text-sub">
          되묻기 기능이 없는 구조입니다. 정보가 부족하면 무엇을 더 적어야 하는지
          답변에 구체적으로 안내해 주세요.
        </p>
        <AnswerForm
          questionId={question.id}
          defaultValue={question.answer ?? ""}
          alreadyAnswered={Boolean(question.answeredAt)}
        />
      </div>
    </div>
  );
}
