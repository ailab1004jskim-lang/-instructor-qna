import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * 마이그레이션은 반드시 풀러를 거치지 않는 직결(direct) 연결로 실행한다.
 * 커넥션 풀러는 세션 상태를 보장하지 않아 스키마 변경에 적합하지 않다.
 * DIRECT_URL 이 없으면(로컬 등 풀러를 안 쓰는 환경) DATABASE_URL 을 그대로 쓴다.
 */
const migrationUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: migrationUrl,
  },
  migrations: {
    // 생성된 Prisma 클라이언트가 TypeScript 소스라 tsx 로 실행한다.
    seed: "tsx prisma/seed.ts",
  },
});
