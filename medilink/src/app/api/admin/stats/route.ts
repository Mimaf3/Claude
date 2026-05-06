import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const [totalVacations, availableVacations, takenVacations, totalUsers, totalSites] =
    await Promise.all([
      prisma.vacation.count(),
      prisma.vacation.count({ where: { status: "available" } }),
      prisma.vacation.count({ where: { status: "taken" } }),
      prisma.user.count({ where: { isActive: true, role: { not: "admin" } } }),
      prisma.site.count({ where: { isActive: true } }),
    ]);

  return NextResponse.json({
    stats: { totalVacations, availableVacations, takenVacations, totalUsers, totalSites },
  });
}
