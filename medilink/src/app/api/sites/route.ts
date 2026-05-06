import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const sites = await prisma.site.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ sites });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { name, address, city, zipCode, phone, description } = body;

  if (!name || !address || !city || !zipCode) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const site = await prisma.site.create({
    data: { name, address, city, zipCode, phone, description },
  });

  // Auto-add site preference for all existing users
  const users = await prisma.user.findMany({ where: { isActive: true, role: { not: "admin" } } });
  for (const u of users) {
    await prisma.userSitePreference.upsert({
      where: { userId_siteId: { userId: u.id, siteId: site.id } },
      update: {},
      create: { userId: u.id, siteId: site.id, enabled: true },
    });
  }

  return NextResponse.json({ site }, { status: 201 });
}
