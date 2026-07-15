import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || (user.role !== "SUPERADMIN" && user.role !== "UNIVERSITY_ADMIN")) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    // If university admin, only show their university's requests
    const whereClause: any = {
      status: "PENDING"
    };
    if (user.role === "UNIVERSITY_ADMIN" && user.universityId) {
      whereClause.universityId = user.universityId;
    }

    const requests = await prisma.verificationRequest.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        university: { select: { id: true, name: true, shortName: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Fetch verifications error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || (user.role !== "SUPERADMIN" && user.role !== "UNIVERSITY_ADMIN")) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const { requestId, status } = await req.json(); // status can be "APPROVED" or "REJECTED"

    if (!requestId || (status !== "APPROVED" && status !== "REJECTED")) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }

    const verificationReq = await prisma.verificationRequest.findUnique({
      where: { id: requestId }
    });

    if (!verificationReq) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    // Check permissions for University Admin
    if (user.role === "UNIVERSITY_ADMIN" && verificationReq.universityId !== user.universityId) {
      return NextResponse.json({ error: "Нет доступа к заявкам этого университета" }, { status: 403 });
    }

    const updatedReq = await prisma.verificationRequest.update({
      where: { id: requestId },
      data: { status }
    });

    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: verificationReq.userId },
        data: { 
          role: "STUDENT", 
          universityId: verificationReq.universityId 
        }
      });
    }

    return NextResponse.json(updatedReq);
  } catch (error) {
    console.error("Update verification error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
