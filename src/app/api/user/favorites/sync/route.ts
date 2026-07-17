import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  filterValidFavoriteIds,
  getMissingFavoriteIds,
  mergeFavoriteIds,
} from "@/lib/favoritesSync";
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
      
      const combined = mergeFavoriteIds(dbProductIds, localFavorites);
      const missing = getMissingFavoriteIds(combined, dbProductIds);
      
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: missing } },
        select: { id: true }
      });
      const validMissingIds = filterValidFavoriteIds(
        missing,
        new Set(existingProducts.map(p => p.id)),
      );
      
      if (validMissingIds.length > 0) {
        await prisma.favorite.createMany({
          data: validMissingIds.map(pid => ({ userId: session.user.id, productId: pid })),
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
        const existingProducts = await prisma.product.findMany({
          where: { id: { in: localFavorites } },
          select: { id: true }
        });
        const validLocalIds = filterValidFavoriteIds(
          localFavorites,
          new Set(existingProducts.map(p => p.id)),
        );
        
        if (validLocalIds.length > 0) {
          await prisma.favorite.createMany({
            data: validLocalIds.map(pid => ({ userId: session.user.id, productId: pid })),
            skipDuplicates: true
          });
        }
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Favorites sync error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
