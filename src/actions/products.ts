"use server";
import { prisma } from "@/lib/prisma";
import { Product } from "@/types";

export async function getPublicProducts() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    include: { university: true },
    orderBy: { createdAt: "desc" }
  });

  return products.map(p => ({
    ...p,
    description: p.description || "",
  })) as unknown as Product[];
}

export async function getPublicUniversities() {
  const unis = await prisma.university.findMany({
    include: {
      _count: {
        select: { products: { where: { isPublished: true } } }
      }
    }
  });

  const allProductsCount = await prisma.product.count({ where: { isPublished: true, universityId: { not: null } } });

  return [
    { id: "all", shortName: "Все университеты", fullName: "Все университеты", count: allProductsCount, mark: "U", tone: "#86a8d8" },
    ...unis.map((u: any) => ({
      ...u,
      count: u._count.products
    }))
  ];
}
