import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const preferences = await prisma.userSitePreference.findMany({
    where: { userId: session.userId },
    include: { site: true },
  });

  return NextResponse.json({ preferences });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { siteId, enabled } = await req.json();

  await prisma.userSitePreference.upsert({
    where: { userId_siteId: { userId: session.userId, siteId } },
    update: { enabled },
    create: { userId: session.userId, siteId, enabled },
  });

  return NextResponse.json({ ok: true });
}
