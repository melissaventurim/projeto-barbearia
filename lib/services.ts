import { prisma } from "@/lib/prisma";

export async function getActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      durationInMin: true,
      active: true,
    },
  });
}
