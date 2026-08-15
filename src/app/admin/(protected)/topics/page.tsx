import { prisma } from "@/lib/prisma";
import { TopicManager } from "@/components/admin/TopicManager";

export const dynamic = "force-dynamic";

export default async function AdminTopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">질문 유형</h1>
      <TopicManager topics={topics} />
    </div>
  );
}
