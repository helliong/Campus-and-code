import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { universityId, documentUrl } = await req.json();

    if (!universityId) {
      return NextResponse.json({ error: "Университет обязателен" }, { status: 400 });
    }

    const university = await prisma.university.findUnique({
      where: { id: universityId }
    });

    if (!university) {
      return NextResponse.json({ error: "Университет не найден" }, { status: 404 });
    }

    // Check existing pending request
    const existingReq = await prisma.verificationRequest.findFirst({
      where: { userId: session.user.id, status: "PENDING" }
    });

    if (existingReq) {
      return NextResponse.json({ error: "У вас уже есть заявка на рассмотрении" }, { status: 400 });
    }

    // 1. Auto-verification by email domain
    const userEmail = session.user.email || "";
    const emailDomain = userEmail.split("@")[1];
    
    let isAutoVerified = false;
    if (emailDomain && university.emailDomains.includes(emailDomain)) {
      isAutoVerified = true;
    }

    if (isAutoVerified) {
      // Create request and automatically approve it
      await prisma.verificationRequest.create({
        data: {
          userId: session.user.id,
          universityId,
          status: "APPROVED"
        }
      });

      // Update user role
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "STUDENT", universityId }
      });

      return NextResponse.json({ message: "Статус студента автоматически подтвержден", autoVerified: true });
    } else {
      // 2. Manual verification
      if (!documentUrl) {
        return NextResponse.json({ error: "Необходимо загрузить фото студенческого билета." }, { status: 400 });
      }

      await prisma.verificationRequest.create({
        data: {
          userId: session.user.id,
          universityId,
          documentUrl,
          status: "PENDING"
        }
      });

      return NextResponse.json({ message: "Заявка отправлена на модерацию", autoVerified: false });
    }

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
