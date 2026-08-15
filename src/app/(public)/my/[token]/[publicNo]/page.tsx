import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findStudentByToken } from "@/lib/student";
import { Prose, Field } from "@/components/Prose";
import {
  formatDateTime,
  statusOf,
  FIELD_LABELS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MyQuestionDetailPage({
  params,
}: PageProps<"/my/[token]/[publicNo]">) {
  const { token, publicNo } = await params;

  const student = await findStudentByToken(token);
  if (!student) notFound();

  // 토큰은 학생을 특정할 뿐이다. 질문 소유권을 함께 검증하지 않으면
  // 토큰 하나로 다른 학생의 질문까지 열람할 수 있게 된다 (PRD §3.2).
  const question = await prisma.question.findFirst({
    where: {
      publicNo: decodeURIComponent(publicNo),
      studentId: student.id,
    },
    include: { topic: { select: { label: true } } },
  });
  if (!question) notFound();

  const status = statusOf(question.answeredAt);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="card p-5 md:p-7">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-sm tracking-wide text-primary">
            {question.publicNo}
          </span>
          <span className={status.badgeClass}>{status.label}</span>
        </div>
        <p className="mt-2 text-xs text-sub">
          {question.topic.label} · {formatDateTime(question.createdAt)}
        </p>

        <div className="mt-6 space-y-4">
          <Field label={FIELD_LABELS.context} value={question.context} />
          <Field label={FIELD_LABELS.tried} value={question.tried} />
          <Field label={FIELD_LABELS.problem} value={question.problem} />
        </div>
      </div>

      <div className="card p-5 md:p-7">
        <h2 className="text-sm font-bold">강사 답변</h2>
        {question.answer && question.answeredAt ? (
          <>
            <p className="mt-1 text-xs text-sub">
              {formatDateTime(question.answeredAt)}
            </p>
            <div className="mt-4 rounded-lg bg-info-bg px-4 py-3.5">
              <Prose>{question.answer}</Prose>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-sub">
            아직 답변이 등록되지 않았습니다. 답변이 등록되면 이메일로
            알려드립니다.
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <Link href={`/my/${token}`} className="btn-secondary">
          내 질문 목록
        </Link>
      </div>
    </div>
  );
}
