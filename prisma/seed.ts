import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const universitiesData = [
  { id: "mgu", slug: "mgu", shortName: "МГУ", name: "Московский государственный университет им. М. В. Ломоносова", tone: "#8fb0d4", mark: "М" },
  { id: "mifi", slug: "mifi", shortName: "МИФИ", name: "Национальный исследовательский ядерный университет", tone: "#7fa6ff", mark: "⚛" },
  { id: "spbgu", slug: "spbgu", shortName: "СПбГУ", name: "Санкт-Петербургский государственный университет", tone: "#d5d1c7", mark: "✹" },
  { id: "vshe", slug: "vshe", shortName: "ВШЭ", name: "Высшая школа экономики", tone: "#d8d8d8", mark: "B" },
  { id: "mfti", slug: "mfti", shortName: "МФТИ", name: "Московский физико-технический институт", tone: "#d5e5ff", mark: "Λ" },
  { id: "urfu", slug: "urfu", shortName: "УрФУ", name: "Уральский федеральный университет", tone: "#d9d9d9", mark: "У" },
  { id: "tgu", slug: "tgu", shortName: "ТГУ", name: "Томский государственный университет", tone: "#b4c8e6", mark: "T" },
  { id: "rudn", slug: "rudn", shortName: "РУДН", name: "Российский университет дружбы народов", tone: "#d0c1a1", mark: "R" },
];

const universityProductsData = [
  {
    name: "Худи МГУ",
    description: "Темно-синее худи с университетской эмблемой.",
    price: 3690,
    imageUrl: "/category-hoodie-premium.webp",
    category: "hoodie",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["darkblue"],
    materials: ["Хлопок", "Футер"],
    inStock: true,
    universityId: "mgu",
    badge: "М",
    slug: "hoodie-mgu"
  },
  {
    name: "Футболка МИФИ",
    description: "Светлая футболка с принтом МИФИ.",
    price: 1490,
    imageUrl: "/category-tshirt-white-premium.webp",
    category: "tshirt",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["white"],
    materials: ["Хлопок"],
    inStock: true,
    universityId: "mifi",
    badge: "⚛",
    slug: "tshirt-mifi"
  },
  {
    name: "Блокнот СПбГУ",
    description: "Блокнот с плотной обложкой и университетской графикой.",
    price: 590,
    imageUrl: "/category-teams-premium.webp",
    category: "other",
    materials: ["Бумага"],
    inStock: true,
    universityId: "spbgu",
    badge: "✹",
    slug: "notebook-spbgu"
  },
  {
    name: "Кружка ВШЭ",
    description: "Матовая керамическая кружка.",
    price: 690,
    imageUrl: "/category-accessories-premium.webp",
    category: "mug",
    availableColors: ["black"],
    materials: ["Керамика"],
    inStock: true,
    universityId: "vshe",
    badge: "B",
    slug: "mug-vshe"
  },
  {
    name: "Шоппер МФТИ",
    description: "Хлопковый шоппер для учебы и ноутбука.",
    price: 890,
    imageUrl: "/category-university-grey.webp",
    category: "other",
    availableColors: ["beige"],
    materials: ["Хлопок", "Холст"],
    inStock: true,
    universityId: "mfti",
    badge: "Λ",
    slug: "shopper-mfti"
  },
  {
    name: "Стикерпак УрФУ",
    description: "Набор виниловых стикеров для ноутбука.",
    price: 390,
    imageUrl: "/category-stickers-white-premium3.webp",
    category: "sticker",
    materials: ["Бумага"],
    inStock: true,
    universityId: "urfu",
    badge: "У",
    slug: "stickerpack-urfu"
  },
  {
    name: "Кепка ТГУ",
    description: "Темно-синяя кепка с лаконичной вышивкой.",
    price: 990,
    imageUrl: "/category-accessories-premium.webp",
    category: "accessories",
    availableColors: ["darkblue"],
    materials: ["Хлопок"],
    inStock: true,
    universityId: "tgu",
    badge: "T",
    slug: "cap-tgu"
  },
  {
    name: "Футболка РУДН",
    description: "Футболка с университетским знаком.",
    price: 1490,
    imageUrl: "/category-tshirt-white-premium.webp",
    category: "tshirt",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["white"],
    materials: ["Хлопок"],
    inStock: true,
    universityId: "rudn",
    badge: "R",
    slug: "tshirt-rudn"
  }
];

const mockProductsData = [
  {
    name: "Худи RTF",
    description: "Стильное худи с логотипом RTF. Идеально для повседневной носки.",
    price: 3690,
    imageUrl: "/category-hoodie-premium.webp",
    category: "hoodie",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["black"],
    materials: ["Хлопок", "Футер"],
    inStock: true,
    slug: "hoodie-rtf"
  },
  {
    name: "Футболка Frontend Club",
    description: "Светлая футболка для настоящих фронтендеров.",
    price: 1490,
    imageUrl: "/category-tshirt-premium.webp",
    category: "tshirt",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["white"],
    materials: ["Хлопок"],
    inStock: true,
    slug: "tshirt-frontend-club"
  },
  {
    name: "Стикерпак React",
    description: "Набор виниловых стикеров с логотипами React, Next.js и Vercel.",
    price: 390,
    imageUrl: "/category-stickers-premium.webp",
    category: "sticker",
    materials: ["Бумага"],
    inStock: false,
    slug: "stickers-react"
  },
  {
    name: "Кепка Developer",
    description: "Черная кепка с вышивкой Developer.",
    price: 990,
    imageUrl: "/category-accessories-premium.webp",
    category: "accessories",
    availableColors: ["black"],
    materials: ["Хлопок", "Полиэстер"],
    inStock: true,
    slug: "cap-developer"
  },
  {
    name: "Кружка УрФУ",
    description: "Керамическая кружка с логотипом УрФУ.",
    price: 690,
    imageUrl: "/category-accessories-premium.webp",
    category: "mug",
    availableColors: ["white"],
    materials: ["Керамика"],
    inStock: true,
    universityId: "urfu",
    slug: "mug-urfu-generic"
  },
  {
    name: "Шоппер Code Mode",
    description: "Вместительный шоппер для ноутбука и конспектов.",
    price: 890,
    imageUrl: "/category-university-grey.webp",
    category: "other",
    materials: ["Хлопок", "Холст"],
    inStock: true,
    slug: "shopper-code-mode"
  },
  {
    name: "Блокнот Dev Notes",
    description: "Черный блокнот для записи гениальных идей и архитектурных решений.",
    price: 590,
    imageUrl: "/category-teams-premium.webp",
    category: "other",
    materials: ["Бумага"],
    inStock: true,
    slug: "notebook-dev-notes"
  },
  {
    name: "Худи RTF (backprint)",
    description: "Худи с принтом на спине.",
    price: 3690,
    imageUrl: "/category-hoodie-premium.webp",
    category: "hoodie",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["black", "blue"],
    materials: ["Хлопок", "Футер"],
    inStock: false,
    slug: "hoodie-rtf-backprint"
  },
  {
    name: "Футболка Code Icon",
    description: "Базовая футболка с принтом кода.",
    price: 1490,
    imageUrl: "/category-tshirt-premium.webp",
    category: "tshirt",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["white", "black"],
    materials: ["Хлопок"],
    inStock: true,
    slug: "tshirt-code-icon"
  },
  {
    name: "Стикеры Git Commit",
    description: "Стикеры для любителей коммитов.",
    price: 390,
    imageUrl: "/category-stickers-premium.webp",
    category: "sticker",
    materials: ["Бумага"],
    inStock: true,
    slug: "stickers-git-commit"
  },
  {
    name: "Кружка Code Mode",
    description: "Черная матовая кружка для крепкого кофе.",
    price: 690,
    imageUrl: "/category-accessories-premium.webp",
    category: "mug",
    availableColors: ["black"],
    materials: ["Керамика"],
    inStock: true,
    slug: "mug-code-mode"
  },
  {
    name: "Блокнот Code Plan",
    description: "Блокнот для планирования спринтов.",
    price: 590,
    imageUrl: "/category-teams-premium.webp",
    category: "other",
    materials: ["Бумага"],
    inStock: true,
    slug: "notebook-code-plan"
  }
];

async function main() {
  console.log("Starting DB seed...");
  
  // Clear existing
  await prisma.cartItem.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.university.deleteMany();

  // Create Universities
  for (const uni of universitiesData) {
    await prisma.university.create({ data: uni });
  }
  console.log("Universities seeded.");

  // Create Products
  const allProducts = [...universityProductsData, ...mockProductsData];
  for (const prod of allProducts) {
    await prisma.product.create({ data: prod });
  }
  console.log("Products seeded.");

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
