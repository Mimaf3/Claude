import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { firstName, lastName, phone, speciality, rppsNumber } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(speciality !== undefined && { speciality }),
      ...(rppsNumber !== undefined && { rppsNumber }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      speciality: true,
      rppsNumber: true,
    },
  });

  return NextResponse.json({ user });
}
