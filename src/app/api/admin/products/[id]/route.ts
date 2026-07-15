import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

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
      : data.universityId || existingProduct.universityId;

    const slug = data.slug || existingProduct.slug;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: slug,
        sku: data.sku.trim().replace(/\s+/g, '-'),
        description: data.description || "",
        price: Number(data.price),
        oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
        imageUrl: data.imageUrl,
        images: data.images || (data.imageUrl ? [data.imageUrl] : []),
        category: data.category,
        availableSizes: data.availableSizes || [],
        availableColors: data.availableColors || [],
        materials: data.materials || [],
        stockCount: Number(data.stockCount) || 0,
        inStock: data.inStock !== undefined ? data.inStock : true,
        universityId: universityIdToUse as string | null,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
      }
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

    await prisma.product.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 });
  }
}
