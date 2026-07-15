"use client";

import Image from "next/image";
import Link from "next/link";
import { type ComponentType, useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiSearch,
  FiCheck,
} from "react-icons/fi";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import "./page.scss";

type University = {
  id: string;
  shortName: string;
  fullName: string;
  count: number;
  mark: string;
  tone: string;
};

type UniversityProduct = Product & {
  university: string;
  badge: string;
};

type FilterState = {
  category: string;
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  materials: string[];
  universities: string[];
  inStock: boolean;
};

const universities: University[] = [
  { id: "all", shortName: "Все университеты", fullName: "Все университеты", count: 36, mark: "U", tone: "#86a8d8" },
  { id: "mgu", shortName: "МГУ", fullName: "Московский государственный университет им. М. В. Ломоносова", count: 12, mark: "М", tone: "#8fb0d4" },
  { id: "mifi", shortName: "МИФИ", fullName: "Национальный исследовательский ядерный университет", count: 8, mark: "⚛", tone: "#7fa6ff" },
  { id: "spbgu", shortName: "СПбГУ", fullName: "Санкт-Петербургский государственный университет", count: 10, mark: "✹", tone: "#d5d1c7" },
  { id: "vshe", shortName: "ВШЭ", fullName: "Высшая школа экономики", count: 9, mark: "B", tone: "#d8d8d8" },
  { id: "mfti", shortName: "МФТИ", fullName: "Московский физико-технический институт", count: 7, mark: "Λ", tone: "#d5e5ff" },
  { id: "urfu", shortName: "УрФУ", fullName: "Уральский федеральный университет", count: 9, mark: "У", tone: "#d9d9d9" },
  { id: "tgu", shortName: "ТГУ", fullName: "Томский государственный университет", count: 6, mark: "T", tone: "#b4c8e6" },
  { id: "rudn", shortName: "РУДН", fullName: "Российский университет дружбы народов", count: 5, mark: "R", tone: "#d0c1a1" },
];

const categories = [
  { id: "all", name: "Все товары", count: 128 },
  { id: "hoodie", name: "Худи", count: 23 },
  { id: "tshirt", name: "Футболки", count: 34 },
  { id: "sticker", name: "Стикеры", count: 28 },
  { id: "accessories", name: "Аксессуары", count: 42 },
  { id: "mug", name: "Кружки", count: 15 },
  { id: "other", name: "Шопперы", count: 18 },
  { id: "notebook", name: "Блокноты", count: 12 },
];

const products: UniversityProduct[] = [
  {
    id: "uni-1",
    name: "Худи МГУ",
    description: "Темно-синее худи с университетской эмблемой.",
    price: 3690,
    imageUrl: "/category-hoodie-premium.webp",
    category: "hoodie",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["darkblue"],
    materials: ["Хлопок", "Футер"],
    inStock: true,
    university: "mgu",
    badge: "М",
  },
  {
    id: "uni-2",
    name: "Футболка МИФИ",
    description: "Светлая футболка с принтом МИФИ.",
    price: 1490,
    imageUrl: "/category-tshirt-white-premium.webp",
    category: "tshirt",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["white"],
    materials: ["Хлопок"],
    inStock: true,
    university: "mifi",
    badge: "⚛",
  },
  {
    id: "uni-3",
    name: "Блокнот СПбГУ",
    description: "Блокнот с плотной обложкой и университетской графикой.",
    price: 590,
    imageUrl: "/category-teams-premium.webp",
    category: "other",
    materials: ["Бумага"],
    inStock: true,
    university: "spbgu",
    badge: "✹",
  },
  {
    id: "uni-4",
    name: "Кружка ВШЭ",
    description: "Матовая керамическая кружка.",
    price: 690,
    imageUrl: "/category-accessories-premium.webp",
    category: "mug",
    availableColors: ["black"],
    materials: ["Керамика"],
    inStock: true,
    university: "vshe",
    badge: "B",
  },
  {
    id: "uni-5",
    name: "Шоппер МФТИ",
    description: "Хлопковый шоппер для учебы и ноутбука.",
    price: 890,
    imageUrl: "/category-university-grey.webp",
    category: "other",
    availableColors: ["beige"],
    materials: ["Хлопок", "Холст"],
    inStock: true,
    university: "mfti",
    badge: "Λ",
  },
  {
    id: "uni-6",
    name: "Стикерпак УрФУ",
    description: "Набор виниловых стикеров для ноутбука.",
    price: 390,
    imageUrl: "/category-stickers-white-premium3.webp",
    category: "sticker",
    materials: ["Бумага"],
    inStock: true,
    university: "urfu",
    badge: "У",
  },
  {
    id: "uni-7",
    name: "Кепка ТГУ",
    description: "Темно-синяя кепка с лаконичной вышивкой.",
    price: 990,
    imageUrl: "/category-accessories-premium.webp",
    category: "accessories",
    availableColors: ["darkblue"],
    materials: ["Хлопок"],
    inStock: true,
    university: "tgu",
    badge: "T",
  },
  {
    id: "uni-8",
    name: "Футболка РУДН",
    description: "Футболка с университетским знаком.",
    price: 1490,
    imageUrl: "/category-tshirt-white-premium.webp",
    category: "tshirt",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["white"],
    materials: ["Хлопок"],
    inStock: true,
    university: "rudn",
    badge: "R",
  },
];

const minPrice = 390;
const maxPrice = 3690;
const filterColors = [
  { id: "black", hex: "#0c1116" },
  { id: "white", hex: "#f3f0e9" },
  { id: "gray", hex: "#d4d7dc" },
  { id: "darkblue", hex: "#142744" },
  { id: "beige", hex: "#9b8870" },
  { id: "green", hex: "#17342e" },
];
const filterSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const filterMaterials = ["Хлопок", "Футер", "Полиэстер", "Керамика", "Металл", "Бумага", "Холст"];
const defaultFilters: FilterState = {
  category: "all",
  priceRange: [minPrice, maxPrice],
  colors: [],
  sizes: [],
  materials: [],
  universities: [],
  inStock: false,
};

const collectionCards = [
  { university: universities[1], image: "/banner-one.webp", className: "mgu" },
  { university: universities[2], image: "/banner-two.webp", className: "mifi" },
  { university: universities[3], image: "/hero-moc.webp", className: "spbgu" },
  { university: universities[4], image: "/hero-mockup.webp", className: "vshe" },
];


export default function UniversitiesPage() {
  const [draftFilters, setDraftFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);

  const setCategoryFilter = (category: string) => {
    setDraftFilters((currentFilters) => ({ ...currentFilters, category }));
    setAppliedFilters((currentFilters) => ({ ...currentFilters, category }));
  };

  const toggleFilterValue = (key: "colors" | "sizes" | "materials" | "universities", value: string) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [key]: currentFilters[key].includes(value)
        ? currentFilters[key].filter((item) => item !== value)
        : [...currentFilters[key], value],
    }));
  };

  const hasChanges = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const handleTabClick = (universityId: string) => {
    const newUniversities = universityId === "all" ? [] : [universityId];
    setDraftFilters((curr) => ({ ...curr, universities: newUniversities }));
    setAppliedFilters((curr) => ({ ...curr, universities: newUniversities }));
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesUniversity = appliedFilters.universities.length === 0 || appliedFilters.universities.includes(product.university);
      const matchesCategory = appliedFilters.category === "all" || product.category === appliedFilters.category;
      const matchesPrice = product.price >= appliedFilters.priceRange[0] && product.price <= appliedFilters.priceRange[1];
      const matchesColor =
        appliedFilters.colors.length === 0 || product.availableColors?.some((color) => appliedFilters.colors.includes(color));
      const matchesSize =
        appliedFilters.sizes.length === 0 || product.availableSizes?.some((size) => appliedFilters.sizes.includes(size));
      const matchesMaterial =
        appliedFilters.materials.length === 0 || product.materials?.some((material) => appliedFilters.materials.includes(material));
      const matchesStock = !appliedFilters.inStock || product.inStock;

      return matchesUniversity && matchesCategory && matchesPrice && matchesColor && matchesSize && matchesMaterial && matchesStock;
    });
  }, [appliedFilters]);

  return (
    <main className="universities-page">
      <div className="universities-breadcrumbs">
        <Link href="/">Главная</Link>
        <FiChevronRight />
        <span>Университеты</span>
      </div>

      <section className="universities-hero">
        <h1>Университеты</h1>
        <p>Мерч твоего вуза. Гордимся, где учимся.</p>
      </section>

      <section className="universities-tabs" aria-label="Выбор университета">
        {universities.map((university) => {
          const isActive =
            university.id === "all"
              ? appliedFilters.universities.length === 0
              : appliedFilters.universities.length === 1 && appliedFilters.universities[0] === university.id;

          return (
            <button
              key={university.id}
              className={isActive ? "active" : ""}
              type="button"
              onClick={() => handleTabClick(university.id)}
            >
              <span className="tab-mark" style={{ color: university.tone }}>
                {university.mark}
              </span>
              <span>
                <strong>{university.shortName}</strong>
                <small>{university.count}</small>
              </span>
            </button>
          );
        })}
      </section>

      <div className="universities-layout">
        <aside className="universities-sidebar">
          <div className="filter-group">
            <h3>Категории</h3>
            <ul className="category-filter-list">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className={draftFilters.category === category.id ? "active" : ""}
                  onClick={() => setCategoryFilter(category.id)}
                >
                  <span className="name">{category.name}</span>
                  <span className="count">{category.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h3>Выберите университет</h3>
            <label className="university-search">
              <FiSearch />
              <input type="search" placeholder="Поиск по университетам" />
            </label>
            <div className="checkbox-list">
              {universities.slice(1).map((university) => (
                <label key={university.id} className="custom-checkbox flex-between">
                  <div className="checkbox-left">
                    <input
                      type="checkbox"
                      checked={draftFilters.universities.includes(university.id)}
                      onChange={() => toggleFilterValue("universities", university.id)}
                    />
                    <span className="checkmark"><FiCheck /></span>
                    <span className="label-text">{university.shortName}</span>
                  </div>
                  <span className="count-label">{university.count}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Цена, ₽</h3>
            <div className="price-slider-placeholder">
              <input
                type="range"
                className="range-input"
                min={minPrice}
                max={maxPrice}
                value={draftFilters.priceRange[0]}
                onChange={(event) => {
                  const nextMin = Math.min(Number(event.target.value), draftFilters.priceRange[1] - 100);
                  setDraftFilters((currentFilters) => ({ ...currentFilters, priceRange: [nextMin, currentFilters.priceRange[1]] }));
                }}
              />
              <input
                type="range"
                className="range-input"
                min={minPrice}
                max={maxPrice}
                value={draftFilters.priceRange[1]}
                onChange={(event) => {
                  const nextMax = Math.max(Number(event.target.value), draftFilters.priceRange[0] + 100);
                  setDraftFilters((currentFilters) => ({ ...currentFilters, priceRange: [currentFilters.priceRange[0], nextMax] }));
                }}
              />
              <div className="slider-track">
                <div
                  className="slider-range"
                  style={{
                    left: `${((draftFilters.priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                    right: `${100 - ((draftFilters.priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="price-inputs">
              <input
                type="text"
                value={draftFilters.priceRange[0]}
                onChange={(event) => {
                  const nextMin = Math.min(Number(event.target.value.replace(/\D/g, "")) || minPrice, draftFilters.priceRange[1] - 100);
                  setDraftFilters((currentFilters) => ({ ...currentFilters, priceRange: [nextMin, currentFilters.priceRange[1]] }));
                }}
              />
              <input
                type="text"
                value={draftFilters.priceRange[1]}
                onChange={(event) => {
                  const nextMax = Math.max(Number(event.target.value.replace(/\D/g, "")) || maxPrice, draftFilters.priceRange[0] + 100);
                  setDraftFilters((currentFilters) => ({ ...currentFilters, priceRange: [currentFilters.priceRange[0], nextMax] }));
                }}
              />
            </div>
          </div>

          <div className="filter-group">
            <h3>Цвет</h3>
            <div className="color-picker">
              {filterColors.map((color) => (
                <button
                  key={color.id}
                  className={`color-swatch ${draftFilters.colors.includes(color.id) ? "active" : ""}`}
                  style={{ backgroundColor: color.hex }}
                  type="button"
                  aria-label={`Цвет ${color.id}`}
                  onClick={() => toggleFilterValue("colors", color.id)}
                />
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Размер</h3>
            <div className="checkbox-list">
              {filterSizes.map((size) => (
                <label key={size} className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={draftFilters.sizes.includes(size)}
                    onChange={() => toggleFilterValue("sizes", size)}
                  />
                  <span className="checkmark"><FiCheck /></span>
                  <span className="label-text">{size}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Материал</h3>
            <div className="checkbox-list">
              {filterMaterials.map((material) => (
                <label key={material} className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={draftFilters.materials.includes(material)}
                    onChange={() => toggleFilterValue("materials", material)}
                  />
                  <span className="checkmark"><FiCheck /></span>
                  <span className="label-text">{material}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Наличие</h3>
            <label className="custom-checkbox flex-between">
              <div className="checkbox-left">
                <input
                  type="checkbox"
                  checked={draftFilters.inStock}
                  onChange={(event) => setDraftFilters((currentFilters) => ({ ...currentFilters, inStock: event.target.checked }))}
                />
                <span className="checkmark"><FiCheck /></span>
                <span className="label-text">В наличии</span>
              </div>
              <span className="count-label"></span>
            </label>
          </div>

          <div className="filter-actions">
            {hasChanges && (
              <button className="apply-filters-btn" onClick={applyFilters}>
                Применить
              </button>
            )}
            <button className="reset-filters-btn" type="button" onClick={resetFilters}>
              Сбросить фильтры <FiRefreshCw />
            </button>
          </div>
        </aside>

        <section className="universities-content">
          <div className="universities-toolbar">
            <button className="sort-button" type="button">
              <span>Сортировать:</span>
              по популярности
              <FiChevronDown />
            </button>
            <div className="view-buttons">
              <button className="active" type="button" aria-label="Сетка">
                <FiGrid />
              </button>
              <button type="button" aria-label="Список">
                <FiList />
              </button>
            </div>
          </div>

          <div className="universities-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="university-collections">
            {collectionCards.map(({ university, image, className }) => (
              <Link href={`/universities?university=${university.id}`} className={`collection-card ${className}`} key={university.id}>
                <Image src={image} alt={university.fullName} fill sizes="(max-width: 900px) 100vw, 50vw" />
                <span className="collection-overlay" />
                <span className="collection-copy">
                  <strong>{university.shortName}</strong>
                  <small>{university.fullName}</small>
                  <em>Смотреть коллекцию <FiChevronRight /></em>
                </span>
                <span className="collection-mark">{university.mark}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
