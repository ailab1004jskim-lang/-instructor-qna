import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    // 생성된 Prisma 클라이언트가 TypeScript 소스라 tsx 로 실행한다.
    seed: "tsx prisma/seed.ts",
  },
});
