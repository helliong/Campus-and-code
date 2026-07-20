import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { filterValidCartItems, limitCartItemsToStock, mergeCartItems } from "@/lib/cart/cartSync";
import { prisma } from "@/lib/database/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { action, localCart } = await req.json();
    if (!Array.isArray(localCart)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    if (action === 'merge') {
      const dbCartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id }
      });

      const localProductIds = [...dbCartItems.map((item) => item.productId), ...localCart.map(i => i.productId)];
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: localProductIds } },
        select: { id: true, stockCount: true, inStock: true, variants: true }
      });
      const validLocalProductIds = new Set(existingProducts.map(p => p.id));
      const mergedCart = limitCartItemsToStock(
        mergeCartItems(dbCartItems, localCart, validLocalProductIds, session.user.id),
        existingProducts,
      );

      await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
      if (mergedCart.length > 0) {
        await prisma.cartItem.createMany({
          data: mergedCart.map(item => ({
            userId: session.user.id,
            productId: item.productId,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          }))
        });
      }

      const finalCartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true }
      });

      return NextResponse.json({ cartItems: finalCartItems }, { status: 200 });
    }

    if (action === 'save') {
      await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
      if (localCart.length > 0) {
        const localProductIds = localCart.map(i => i.productId);
        const existingProducts = await prisma.product.findMany({
          where: { id: { in: localProductIds } },
          select: { id: true, stockCount: true, inStock: true, variants: true }
        });
        const validLocalProductIds = new Set(existingProducts.map(p => p.id));
        const validLocalCart = limitCartItemsToStock(
          filterValidCartItems(localCart, validLocalProductIds),
          existingProducts,
        );

        if (validLocalCart.length > 0) {
          await prisma.cartItem.createMany({
            data: validLocalCart.map(item => ({
              userId: session.user.id,
              productId: item.productId,
              quantity: item.quantity,
              selectedSize: item.selectedSize || null,
              selectedColor: item.selectedColor || null
            }))
          });
        }
      }
      const finalCartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true },
      });
      return NextResponse.json({ success: true, cartItems: finalCartItems }, { status: 200 });
    }

    if (action === 'get') {
      const finalCartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true }
      });
      return NextResponse.json({ cartItems: finalCartItems }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
