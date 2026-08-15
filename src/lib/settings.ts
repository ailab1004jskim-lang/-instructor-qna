import { prisma } from "@/lib/prisma";

export async function getSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}
