import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/database/prisma';
import { createAuditLogData } from '@/lib/audit/auditLog';
import {
  getChangedProductFields,
  getProductTotalStock,
  normalizeProductSku,
  normalizeProductVariants,
} from '@/lib/products/productAdmin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user.role !== "UNIVERSITY_ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: { university: true }
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (session.user.role === "UNIVERSITY_ADMIN" && product.universityId !== session.user.universityId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching product" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user.role !== "UNIVERSITY_ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    if (!data.name || !data.price || (!data.imageUrl && (!data.images || data.images.length === 0)) || !data.category || !data.sku) {
       return NextResponse.json({ error: "Missing required fields (including SKU)" }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (session.user.role === "UNIVERSITY_ADMIN" && existingProduct.universityId !== session.user.universityId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const universityIdToUse = session.user.role === "UNIVERSITY_ADMIN"
      ? session.user.universityId
      : data.universityId === undefined
        ? existingProduct.universityId
        : data.universityId || null;

    if (universityIdToUse) {
      const universityExists = await prisma.university.findUnique({
        where: { id: universityIdToUse },
        select: { id: true },
      });

      if (!universityExists) {
        return NextResponse.json({ error: "Selected university does not exist" }, { status: 400 });
      }
    }

    const slug = data.slug || existingProduct.slug;
    const variants = normalizeProductVariants(data.variants);
    const stockCount = getProductTotalStock(variants, data.stockCount);

    const nextPrice = Number(data.price);
    const nextPublishedState = data.isPublished !== undefined ? data.isPublished : true;
    const changedFields = getChangedProductFields(existingProduct, {
      name: data.name,
      price: nextPrice,
      stockCount,
      category: data.category,
      isPublished: nextPublishedState,
      universityId: universityIdToUse as string | null,
    });

    const updatedProduct = await prisma.$transaction(async (transaction) => {
      const product = await transaction.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: slug,
          sku: normalizeProductSku(data.sku),
          description: data.description || "",
          price: nextPrice,
          oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
          imageUrl: data.imageUrl,
          images: data.images || (data.imageUrl ? [data.imageUrl] : []),
          imagesByColor: data.imagesByColor || {},
          category: data.category,
          availableSizes: data.availableSizes || [],
          availableColors: data.availableColors || [],
          materials: data.materials || [],
          stockCount,
          variants,
          inStock: data.inStock !== undefined ? data.inStock : stockCount > 0,
          universityId: universityIdToUse as string | null,
          isPublished: nextPublishedState,
        },
      });

      await transaction.auditLog.create({
        data: createAuditLogData({
          request,
          actor: session.user,
          action: "UPDATE",
          section: "PRODUCTS",
          entityType: "PRODUCT",
          entityId: product.id,
          entityLabel: product.name,
          details: changedFields.length > 0
            ? `Изменены: ${changedFields.join(", ")}`
            : "Товар сохранён без изменения основных полей",
          changes: {
            before: {
              name: existingProduct.name,
              price: existingProduct.price,
              stockCount: existingProduct.stockCount,
              category: existingProduct.category,
              isPublished: existingProduct.isPublished,
              universityId: existingProduct.universityId,
            },
            after: {
              name: product.name,
              price: product.price,
              stockCount: product.stockCount,
              category: product.category,
              isPublished: product.isPublished,
              universityId: product.universityId,
            },
          },
          universityId: product.universityId,
        }),
      });

      return product;
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating product" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user.role !== "UNIVERSITY_ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: id }
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (session.user.role === "UNIVERSITY_ADMIN" && product.universityId !== session.user.universityId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.product.delete({
        where: { id },
      });

      await transaction.auditLog.create({
        data: createAuditLogData({
          request,
          actor: session.user,
          action: "DELETE",
          section: "PRODUCTS",
          entityType: "PRODUCT",
          entityId: product.id,
          entityLabel: product.name,
          details: "Удалён товар",
          universityId: product.universityId,
        }),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 });
  }
}
