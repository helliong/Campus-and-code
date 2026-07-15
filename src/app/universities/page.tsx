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
import { getPublicProducts, getPublicUniversities } from "@/actions/products";
import { useEffect } from "react";
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


const filterColors = [
  { id: "black", hex: "#0c1116" },
  { id: "white", hex: "#f3f0e9" },
  { id: "gray", hex: "#d4d7dc" },
  { id: "darkblue", hex: "#142744" },
  { id: "beige", hex: "#9b8870" },
  { id: "green", hex: "#17342e" },
];
const filterSizes = ["S", "M", "L", "XL"];
const filterMaterials = ["Хлопок", "Футер", "Полиэстер", "Керамика", "Металл", "Бумага", "Холст"];
const defaultFilters: FilterState = {
  category: "all",
  priceRange: [0, 5000],
  colors: [],
  sizes: [],
  materials: [],
  universities: [],
  inStock: false,
};
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


export default function UniversitiesPage() {
  const [draftFilters, setDraftFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);
  const [products, setProducts] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxPriceLimit, setMaxPriceLimit] = useState(5000);

  useEffect(() => {
    Promise.all([getPublicProducts(), getPublicUniversities()]).then(([prods, unis]) => {
      setProducts(prods);
      setUniversities(unis);
      const newMax = prods.length > 0 ? Math.max(...prods.map((p: any) => p.price)) : 5000;
      setMaxPriceLimit(newMax);
      setDraftFilters((prev) => ({ ...prev, priceRange: [prev.priceRange[0], newMax] }));
      setAppliedFilters((prev) => ({ ...prev, priceRange: [prev.priceRange[0], newMax] }));
      setLoading(false);
    });
  }, []);

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
    setDraftFilters({ ...defaultFilters, priceRange: [0, maxPriceLimit] });
    setAppliedFilters({ ...defaultFilters, priceRange: [0, maxPriceLimit] });
  };

  const handleTabClick = (universityId: string) => {
    const newUniversities = universityId === "all" ? [] : [universityId];
    setDraftFilters((curr) => ({ ...curr, universities: newUniversities }));
    setAppliedFilters((curr) => ({ ...curr, universities: newUniversities }));
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesUniversity = appliedFilters.universities.length === 0 || (product.universityId && appliedFilters.universities.includes(product.universityId));
      const matchesCategory = appliedFilters.category === "all" || product.category === appliedFilters.category;
      const matchesPrice = product.price >= appliedFilters.priceRange[0] && product.price <= appliedFilters.priceRange[1];
      const matchesColor =
        appliedFilters.colors.length === 0 || product.availableColors?.some((color: string) => appliedFilters.colors.includes(color));
      const matchesSize =
        appliedFilters.sizes.length === 0 || product.availableSizes?.some((size: string) => appliedFilters.sizes.includes(size));
      const matchesMaterial =
        appliedFilters.materials.length === 0 || product.materials?.some((material: string) => appliedFilters.materials.includes(material));
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
                min={0}
                max={maxPriceLimit}
                value={draftFilters.priceRange[0]}
                onChange={(event) => {
                  const value = Math.min(Number(event.target.value), draftFilters.priceRange[1] - 100);
                  setDraftFilters((currentFilters) => ({ ...currentFilters, priceRange: [value, currentFilters.priceRange[1]] }));
                }}
              />
              <input
                type="range"
                className="range-input"
                min={0}
                max={maxPriceLimit}
                value={draftFilters.priceRange[1]}
                onChange={(event) => {
                  const value = Math.max(Number(event.target.value), draftFilters.priceRange[0] + 100);
                  setDraftFilters((currentFilters) => ({ ...currentFilters, priceRange: [currentFilters.priceRange[0], value] }));
                }}
              />
              <div className="slider-track">
                <div
                  className="slider-range"
                  style={{
                    left: `${(draftFilters.priceRange[0] / maxPriceLimit) * 100}%`,
                    right: `${100 - (draftFilters.priceRange[1] / maxPriceLimit) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="price-inputs">
              <input
                type="text"
                value={draftFilters.priceRange[0]}
                onChange={(event) => {
                  const nextMin = Math.min(Number(event.target.value.replace(/\D/g, "")) || 0, draftFilters.priceRange[1] - 100);
                  setDraftFilters((currentFilters) => ({ ...currentFilters, priceRange: [nextMin, currentFilters.priceRange[1]] }));
                }}
              />
              <input
                type="text"
                value={draftFilters.priceRange[1]}
                onChange={(event) => {
                  const nextMax = Math.max(Number(event.target.value.replace(/\D/g, "")) || maxPriceLimit, draftFilters.priceRange[0] + 100);
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
            {!loading && universities.slice(1, 5).map((university, idx) => {
              const images = ["/banner-one.webp", "/banner-two.webp", "/hero-moc.webp", "/hero-mockup.webp"];
              const image = images[idx % images.length];
              return (
                <Link href={`/universities?university=${university.slug}`} className={`collection-card`} key={university.id}>
                  <Image src={image} alt={university.fullName || "Изображение университета"} fill sizes="(max-width: 900px) 100vw, 50vw" />
                  <span className="collection-overlay" />
                  <span className="collection-copy">
                    <strong>{university.shortName}</strong>
                    <small>{university.fullName}</small>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
