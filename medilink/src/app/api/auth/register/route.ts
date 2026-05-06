import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, role, speciality, rppsNumber } =
      await req.json();

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        firstName,
        lastName,
        phone,
        role,
        speciality,
        rppsNumber,
      },
    });

    // Auto-subscribe to all active sites
    const sites = await prisma.site.findMany({ where: { isActive: true } });
    await prisma.userSitePreference.createMany({
      data: sites.map((s) => ({ userId: user.id, siteId: s.id, enabled: true })),
    });

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
