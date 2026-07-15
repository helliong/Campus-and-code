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

    const { action, localCart } = await req.json();
    if (!Array.isArray(localCart)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    if (action === 'merge') {
      const dbCartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id }
      });

      const mergedCart = [...dbCartItems];

      for (const localItem of localCart) {
        const existingDbItemIndex = mergedCart.findIndex(dbItem => 
          dbItem.productId === localItem.productId && 
          dbItem.selectedSize === (localItem.selectedSize || null) && 
          dbItem.selectedColor === (localItem.selectedColor || null)
        );

        if (existingDbItemIndex > -1) {
          mergedCart[existingDbItemIndex].quantity += localItem.quantity;
        } else {
          mergedCart.push({
            id: 'new',
            userId: session.user.id,
            productId: localItem.productId,
            quantity: localItem.quantity,
            selectedSize: localItem.selectedSize || null,
            selectedColor: localItem.selectedColor || null,
          });
        }
      }

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
        await prisma.cartItem.createMany({
          data: localCart.map(item => ({
            userId: session.user.id,
            productId: item.productId,
            quantity: item.quantity,
            selectedSize: item.selectedSize || null,
            selectedColor: item.selectedColor || null
          }))
        });
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
