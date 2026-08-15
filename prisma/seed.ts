import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

const TOPICS = [
  { label: "강의 내용", hint: "수업에서 다룬 개념·설명에 대한 질문" },
  { label: "과제", hint: "과제 요구사항이나 진행 중 막힌 부분" },
  { label: "행정·수강", hint: "출결, 일정, 자료 등 수업 운영 관련" },
  { label: "기타", hint: "위에 해당하지 않는 질문" },
];

async function main() {
  const existing = await prisma.topic.count();
  if (existing === 0) {
    for (const topic of TOPICS) {
      await prisma.topic.create({ data: topic });
    }
    console.log(`질문 유형 ${TOPICS.length}종을 등록했습니다.`);
  } else {
    console.log(`질문 유형이 이미 ${existing}종 있어 건너뜁니다.`);
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  console.log("설정 레코드를 확인했습니다.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
