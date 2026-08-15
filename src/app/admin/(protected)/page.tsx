import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, statusOf } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="card px-4 py-3.5">
      <p className="text-xs text-sub">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${accent ? "text-warning" : "text-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: PageProps<"/admin">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "pending";
  const topicId = typeof sp.topic === "string" ? sp.topic : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where: Prisma.QuestionWhereInput = {};
  if (status === "pending") where.answeredAt = null;
  else if (status === "answered") where.answeredAt = { not: null };
  if (topicId) where.topicId = topicId;
  if (q) where.submitterName = { contains: q, mode: "insensitive" };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [topics, questions, total, pending, today, answeredThisWeek] =
    await Promise.all([
      prisma.topic.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, label: true },
      }),
      prisma.question.findMany({
        where,
        orderBy: [{ answeredAt: { sort: "asc", nulls: "first" } }, { createdAt: "asc" }],
        take: 100,
        include: { topic: { select: { label: true } } },
      }),
      prisma.question.count(),
      prisma.question.count({ where: { answeredAt: null } }),
      prisma.question.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.question.count({ where: { answeredAt: { gte: weekAgo } } }),
    ]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="답변 대기" value={pending} accent={pending > 0} />
        <StatCard label="오늘 접수" value={today} />
        <StatCard label="최근 7일 답변" value={answeredThisWeek} />
        <StatCard label="전체" value={total} />
      </div>

      <div className="card p-4 md:p-5">
        <form method="get" className="flex flex-wrap items-end gap-2.5">
          <div className="w-32">
            <label htmlFor="status" className="field-label">
              상태
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="field-input"
            >
              <option value="pending">대기</option>
              <option value="answered">답변완료</option>
              <option value="all">전체</option>
            </select>
          </div>
          <div className="w-44">
            <label htmlFor="topic" className="field-label">
              유형
            </label>
            <select
              id="topic"
              name="topic"
              defaultValue={topicId}
              className="field-input"
            >
              <option value="">전체</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-40">
            <label htmlFor="q" className="field-label">
              학생명
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              className="field-input"
              placeholder="이름 일부"
            />
          </div>
          <button type="submit" className="btn-secondary">
            검색
          </button>
          {(topicId || q || status !== "pending") && (
            <Link href="/admin" className="btn-secondary">
              초기화
            </Link>
          )}
        </form>
      </div>

      <div className="card overflow-hidden">
        {questions.length === 0 ? (
          <p className="py-16 text-center text-sm text-sub">
            조건에 맞는 질문이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {questions.map((question) => {
              const s = statusOf(question.answeredAt);
              return (
                <li key={question.id}>
                  <Link
                    href={`/admin/questions/${question.id}`}
                    className={`block px-4 py-3.5 border-l-4 transition-colors hover:bg-bg ${
                      question.answeredAt
                        ? "border-transparent"
                        : "border-warning"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={s.badgeClass}>{s.label}</span>
                      <span className="text-sm font-semibold">
                        {question.submitterName}
                      </span>
                      <span className="text-xs text-sub">
                        {question.topic.label}
                      </span>
                      <span className="ml-auto text-xs text-sub tracking-wide">
                        {question.publicNo}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm line-clamp-1">
                      {question.context}
                    </p>
                    <p className="mt-1 text-xs text-sub">
                      {formatDateTime(question.createdAt)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {questions.length >= 100 ? (
        <p className="text-center text-xs text-sub">
          최근 100건만 표시합니다. 필터를 좁혀 주세요.
        </p>
      ) : null}
    </div>
  );
}
