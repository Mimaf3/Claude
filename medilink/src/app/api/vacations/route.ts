import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendPushToUsersForVacation } from "@/lib/push";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const status = searchParams.get("status");
  const mine = searchParams.get("mine") === "true";

  const where: Record<string, unknown> = {};

  if (mine) {
    where.takenById = session.userId;
  } else if (session.role !== "admin") {
    // Non-admins only see vacations matching their role
    where.requiredRole = session.role;
    where.status = "available";
  }

  if (siteId) where.siteId = siteId;
  if (status && session.role === "admin") where.status = status;

  const vacations = await prisma.vacation.findMany({
    where,
    include: {
      site: { select: { id: true, name: true, city: true, address: true } },
      takenBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({ vacations });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, siteId, requiredRole, speciality, startDate, endDate, hourlyRate, notes } = body;

  if (!title || !siteId || !requiredRole || !startDate || !endDate) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const vacation = await prisma.vacation.create({
    data: {
      title,
      description,
      siteId,
      requiredRole,
      speciality,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      notes,
      status: "available",
    },
    include: {
      site: { select: { id: true, name: true, city: true, address: true } },
    },
  });

  // Create in-app notifications for matching users
  const users = await prisma.user.findMany({
    where: {
      role: requiredRole,
      isActive: true,
      sitePreferences: { some: { siteId, enabled: true } },
    },
  });

  if (users.length > 0) {
    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        vacationId: vacation.id,
        type: "new_vacation",
        title: `Nouvelle vacation : ${title}`,
        message: `${vacation.site.name} – ${new Date(startDate).toLocaleDateString("fr-FR")}`,
        isRead: false,
      })),
    });

    // Send push notifications (async, don't await)
    sendPushToUsersForVacation(vacation.id, siteId, requiredRole, {
      title: `🏥 Nouvelle vacation disponible`,
      body: `${title} – ${vacation.site.name}`,
      url: `/dashboard`,
    }).catch(console.error);
  }

  return NextResponse.json({ vacation }, { status: 201 });
}
