import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rateLimit";
import bcrypt from "bcryptjs";

const REGISTER_RATE_LIMIT = {
  limit: 5,
  windowMs: 60 * 60 * 1000,
};

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const clientIp = getClientIp(req);
    const rateLimit = consumeRateLimit(`register:${clientIp}:${normalizedEmail || "unknown"}`, REGISTER_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Слишком много попыток регистрации. Попробуйте позже." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          },
        },
      );
    }

    if (!normalizedEmail || !password) {
      return NextResponse.json({ message: "Email и пароль обязательны" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "Пользователь успешно создан",
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
