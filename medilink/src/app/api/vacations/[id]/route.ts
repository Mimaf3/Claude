import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendPushToUser, sendPushToUsersForVacation } from "@/lib/push";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const vacation = await prisma.vacation.findUnique({
    where: { id },
    include: {
      site: true,
      takenBy: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
  });

  if (!vacation) return NextResponse.json({ error: "Vacation introuvable" }, { status: 404 });
  return NextResponse.json({ vacation });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const vacation = await prisma.vacation.findUnique({
    where: { id },
    include: { site: true },
  });
  if (!vacation) return NextResponse.json({ error: "Vacation introuvable" }, { status: 404 });

  const body = await req.json();
  const { action } = body;

  // Accept vacation
  if (action === "accept") {
    if (vacation.status !== "available") {
      return NextResponse.json({ error: "Cette vacation n'est plus disponible" }, { status: 409 });
    }

    const updated = await prisma.vacation.update({
      where: { id },
      data: { status: "taken", takenById: session.userId, takenAt: new Date() },
      include: {
        site: true,
        takenBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.userId,
        vacationId: id,
        type: "vacation_taken",
        title: `Vacation confirmée : ${vacation.title}`,
        message: `${vacation.site.name} – ${new Date(vacation.startDate).toLocaleDateString("fr-FR")}`,
      },
    });

    return NextResponse.json({ vacation: updated });
  }

  // Cancel vacation
  if (action === "cancel") {
    const isOwner = vacation.takenById === session.userId;
    const isAdmin = session.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (vacation.status !== "taken") {
      return NextResponse.json({ error: "Cette vacation n'est pas prise" }, { status: 400 });
    }

    const updated = await prisma.vacation.update({
      where: { id },
      data: { status: "available", takenById: null, takenAt: null },
      include: { site: true },
    });

    // Notify the user whose vacation was cancelled
    if (vacation.takenById) {
      await prisma.notification.create({
        data: {
          userId: vacation.takenById,
          vacationId: id,
          type: "vacation_cancelled",
          title: `Vacation annulée : ${vacation.title}`,
          message: `${vacation.site.name} – ${new Date(vacation.startDate).toLocaleDateString("fr-FR")}`,
        },
      });
      await sendPushToUser(vacation.takenById, {
        title: "Vacation annulée",
        body: `${vacation.title} – ${vacation.site.name}`,
        url: "/dashboard",
      });
    }

    // Notify eligible users that the slot is available again
    const users = await prisma.user.findMany({
      where: {
        role: vacation.requiredRole,
        isActive: true,
        sitePreferences: { some: { siteId: vacation.siteId, enabled: true } },
        id: { not: vacation.takenById ?? undefined },
      },
    });

    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          vacationId: id,
          type: "vacation_available_again",
          title: `Vacation disponible à nouveau : ${vacation.title}`,
          message: `${vacation.site.name} – ${new Date(vacation.startDate).toLocaleDateString("fr-FR")}`,
          isRead: false,
        })),
      });

      sendPushToUsersForVacation(id, vacation.siteId, vacation.requiredRole, {
        title: "🔄 Vacation disponible à nouveau",
        body: `${vacation.title} – ${vacation.site.name}`,
        url: "/dashboard",
      }).catch(console.error);
    }

    return NextResponse.json({ vacation: updated });
  }

  // Admin: full update
  if (session.role === "admin") {
    const { title, description, siteId, requiredRole, speciality, startDate, endDate, hourlyRate, notes, status } =
      body;
    const updated = await prisma.vacation.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(siteId && { siteId }),
        ...(requiredRole && { requiredRole }),
        ...(speciality !== undefined && { speciality }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(hourlyRate !== undefined && { hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
      include: {
        site: { select: { id: true, name: true, city: true, address: true } },
        takenBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return NextResponse.json({ vacation: updated });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.notification.deleteMany({ where: { vacationId: id } });
  await prisma.vacation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
