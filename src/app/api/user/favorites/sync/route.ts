import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { action, localFavorites } = await req.json();

    if (action === 'merge' && Array.isArray(localFavorites)) {
      const dbFavorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        select: { productId: true }
      });
      const dbProductIds = dbFavorites.map(f => f.productId);
      
      const combined = Array.from(new Set([...dbProductIds, ...localFavorites]));
      const missing = combined.filter(id => !dbProductIds.includes(id));
      
      if (missing.length > 0) {
        await prisma.favorite.createMany({
          data: missing.map(pid => ({ userId: session.user.id, productId: pid })),
          skipDuplicates: true
        });
      }

      const populatedFavorites = await prisma.product.findMany({
        where: { id: { in: combined } }
      });

      return NextResponse.json({ favorites: populatedFavorites }, { status: 200 });
    }

    if (action === 'save' && Array.isArray(localFavorites)) {
      await prisma.favorite.deleteMany({ where: { userId: session.user.id } });
      if (localFavorites.length > 0) {
        await prisma.favorite.createMany({
          data: localFavorites.map(pid => ({ userId: session.user.id, productId: pid })),
          skipDuplicates: true
        });
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Favorites sync error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
