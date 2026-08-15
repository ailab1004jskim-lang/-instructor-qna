import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QuestionForm } from "@/components/QuestionForm";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const topics = await prisma.topic.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, label: true, hint: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="card p-5 md:p-7">
        <h1 className="text-lg md:text-xl font-bold">질문 보내기</h1>
        <p className="mt-1.5 text-sm text-sub">
          강사가 확인 후 답변을 등록하면 이메일로 알려드립니다.
        </p>

        {topics.length === 0 ? (
          <p className="mt-6 text-sm text-danger bg-danger-bg rounded-lg px-3.5 py-3">
            아직 질문 유형이 등록되지 않아 접수를 받을 수 없습니다. 강사에게
            문의해 주세요.
          </p>
        ) : (
          <div className="mt-6">
            <QuestionForm topics={topics} />
          </div>
        )}
      </div>

      <p className="text-center text-xs text-sub">
        이미 질문을 보내셨나요?{" "}
        <Link href="/link" className="text-primary font-medium underline">
          내 질문 확인 링크 받기
        </Link>
      </p>
    </div>
  );
}
