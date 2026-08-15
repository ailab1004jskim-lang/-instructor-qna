import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findStudentByToken } from "@/lib/student";
import { formatDateTime, statusOf } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MyQuestionsPage({
  params,
}: PageProps<"/my/[token]">) {
  const { token } = await params;
  const student = await findStudentByToken(token);
  if (!student) notFound();

  const questions = await prisma.question.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
    include: { topic: { select: { label: true } } },
  });

  const pending = questions.filter((q) => !q.answeredAt).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="card p-5 md:p-7">
        <h1 className="text-lg font-bold">{student.name}님의 질문</h1>
        <p className="mt-1 text-sm text-sub">
          총 {questions.length}건 · 답변 대기 {pending}건
        </p>

        {questions.length === 0 ? (
          <p className="mt-8 text-center text-sm text-sub">
            아직 보낸 질문이 없습니다.
          </p>
        ) : (
          <ul className="mt-6 space-y-2.5">
            {questions.map((q) => {
              const status = statusOf(q.answeredAt);
              return (
                <li key={q.id}>
                  <Link
                    href={`/my/${token}/${encodeURIComponent(q.publicNo)}`}
                    className="block border border-line rounded-xl p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm tracking-wide text-primary">
                        {q.publicNo}
                      </span>
                      <span className={status.badgeClass}>{status.label}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium line-clamp-2">
                      {q.context}
                    </p>
                    <p className="mt-1.5 text-xs text-sub">
                      {q.topic.label} · {formatDateTime(q.createdAt)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex justify-center gap-2">
        <Link href="/" className="btn-secondary">
          새 질문 보내기
        </Link>
      </div>

      <p className="text-center text-xs text-sub leading-relaxed">
        이 페이지 주소는 본인 확인 수단입니다. 다른 사람에게 공유하지 마세요.
        <br />
        본인이 등록하지 않은 질문이 보인다면 강사에게 알려주세요.
      </p>
    </div>
  );
}
