import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user.role !== "UNIVERSITY_ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    let products;
    if (session.user.role === "UNIVERSITY_ADMIN") {
      products = await prisma.product.findMany({
        where: { universityId: session.user.universityId as string },
        orderBy: { createdAt: 'desc' },
        include: { university: true }
      });
    } else {
       // Superadmin sees all
      products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { university: true }
      });
    }
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user.role !== "UNIVERSITY_ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    if (!data.name || !data.price || !data.imageUrl || !data.category || !data.sku) {
       return NextResponse.json({ error: "Missing required fields (including SKU)" }, { status: 400 });
    }

    // if UNIVERSITY_ADMIN, force their universityId
    const universityIdToUse = session.user.role === "UNIVERSITY_ADMIN" 
      ? session.user.universityId 
      : data.universityId || null;

    // We can auto-generate a slug from the name if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-') + '-' + Date.now();

    const product = await prisma.product.create({
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

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating product" }, { status: 500 });
  }
}
