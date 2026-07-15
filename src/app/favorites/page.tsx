"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState, useEffect } from "react";
import { FiCheck, FiRefreshCw } from "react-icons/fi";
import ProductCard from "@/components/ProductCard";
import { useFavorites } from "@/context/FavoritesContext";
import { Product } from "@/types";
import "./page.scss";

const allCategory = "Все товары";

const categoryLabels: Record<Product["category"], string> = {
  hoodie: "Одежда",
  tshirt: "Одежда",
  mug: "Кружки",
  sticker: "Стикеры",
  accessories: "Аксессуары",
  other: "Разное",
};

const sizeOptions = ["S", "M", "L", "XL"];
const colorOptions = [
  { value: "white", label: "Белый", color: "#ffffff" },
  { value: "beige", label: "Бежевый", color: "#e8e1d7" },
  { value: "blue", label: "Голубой", color: "#b3d4e5" },
  { value: "darkblue", label: "Темно-синий", color: "#1a365d" },
  { value: "green", label: "Зеленый", color: "#2f4f4f" },
  { value: "black", label: "Черный", color: "#111111" },
];

type SortValue = "added" | "priceAsc" | "priceDesc" | "name";
type FilterState = {
  category: string;
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
};

const defaultFilters: FilterState = {
  category: allCategory,
  priceRange: [0, 5000],
  colors: [],
  sizes: [],
};

function getCategoryCounts(products: Product[]) {
  return products.reduce<Record<string, number>>((acc, product) => {
    const category = categoryLabels[product.category];
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
}

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [draftFilters, setDraftFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState<SortValue>("added");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const maxPriceLimit = useMemo(() => favorites.length > 0 ? Math.max(...favorites.map(f => f.price)) : 5000, [favorites]);

  useEffect(() => {
    if (favorites.length > 0) {
      setDraftFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], maxPriceLimit] }));
      setAppliedFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], maxPriceLimit] }));
    }
  }, [maxPriceLimit, favorites.length]);

  const categoryCounts = useMemo(() => getCategoryCounts(favorites), [favorites]);
  const categories = useMemo(
    () => [allCategory, ...Object.keys(categoryCounts)],
    [categoryCounts]
  );
  const hasFilterChanges = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

  const filteredFavorites = useMemo(() => {
    const filtered = favorites.filter((product) => {
      const categoryMatch =
        appliedFilters.category === allCategory || categoryLabels[product.category] === appliedFilters.category;
      const priceMatch =
        product.price >= appliedFilters.priceRange[0] && product.price <= appliedFilters.priceRange[1];
      const sizeMatch =
        appliedFilters.sizes.length === 0 ||
        product.availableSizes?.some((size) => appliedFilters.sizes.includes(size));
      const colorMatch =
        appliedFilters.colors.length === 0 ||
        product.availableColors?.some((color) => appliedFilters.colors.includes(color));

      return categoryMatch && priceMatch && sizeMatch && colorMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "priceAsc") return a.price - b.price;
      if (sort === "priceDesc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name, "ru");
      return 0;
    });
  }, [appliedFilters, favorites, sort]);

  const handleCategoryClick = (category: string) => {
    const nextFilters = { ...draftFilters, category };
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
  };

  const toggleSize = (size: string) => {
    setDraftFilters((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((item) => item !== size)
        : [...current.sizes, size],
    }));
  };

  const toggleColor = (color: string) => {
    setDraftFilters((current) => ({
      ...current,
      colors: current.colors.includes(color)
        ? current.colors.filter((item) => item !== color)
        : [...current.colors, color],
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  const clearFilters = () => {
    setDraftFilters({ ...defaultFilters, priceRange: [0, maxPriceLimit] });
    setAppliedFilters({ ...defaultFilters, priceRange: [0, maxPriceLimit] });
    setSort("added");
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    if (navigator.share) {
      await navigator.share({
        title: "Избранное Campus & Code",
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <main className="favorites-page">
      <nav className="favorites-breadcrumbs" aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span>&gt;</span>
        <span>Избранное</span>
      </nav>

      <header className="favorites-header">
        <div>
          <h1>Избранное</h1>
          <p>
            {favorites.length} {favorites.length === 1 ? "товар" : "товаров"}, которые вам понравились
          </p>
        </div>
        <button className="share-btn" type="button" onClick={handleShare}>
          Поделиться
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.6 10.8 6.8-4.6" />
            <path d="m8.6 13.2 6.8 4.6" />
          </svg>
        </button>
      </header>

      {favorites.length === 0 ? (
        <section className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35a1 1 0 0 1-.64-.23C5.2 15.98 2 12.74 2 8.75A5.73 5.73 0 0 1 7.75 3 6.27 6.27 0 0 1 12 4.75 6.27 6.27 0 0 1 16.25 3 5.73 5.73 0 0 1 22 8.75c0 3.99-3.2 7.23-9.36 12.37a1 1 0 0 1-.64.23Z" />
            </svg>
          </div>
          <h2>В избранном пока ничего нет</h2>
          <p>Добавляйте товары сердечком, чтобы быстро вернуться к ним позже.</p>
          <Link href="/catalog" className="btn-primary">Перейти в каталог</Link>
        </section>
      ) : (
        <div className="favorites-layout">
          <button
            className="mobile-filters-toggle"
            type="button"
            onClick={() => setIsFiltersOpen((current) => !current)}
            aria-expanded={isFiltersOpen}
            aria-controls="favorites-filters"
          >
            Фильтры
            <svg className={isFiltersOpen ? "open" : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <aside
            className={`favorites-filters ${isFiltersOpen ? "open" : ""}`}
            id="favorites-filters"
            aria-label="Фильтры избранного"
          >
            <div className="filter-group">
              <h3>Категории</h3>
              <ul className="category-filter-list">
                {categories.map((category) => (
                  <li
                    className={draftFilters.category === category ? "active" : ""}
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <span className="name">{category}</span>
                    <span className="count">{category === allCategory ? favorites.length : categoryCounts[category]}</span>
                  </li>
                ))}
              </ul>
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
                    setDraftFilters((current) => ({ ...current, priceRange: [value, current.priceRange[1]] }));
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
                    setDraftFilters((current) => ({ ...current, priceRange: [current.priceRange[0], value] }));
                  }}
                />
                <div className="slider-track">
                  <div
                    className="slider-range"
                    style={{
                      left: `${(draftFilters.priceRange[0] / maxPriceLimit) * 100}%`,
                      right: `${100 - (draftFilters.priceRange[1] / maxPriceLimit) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="price-inputs">
                <input
                  inputMode="numeric"
                  value={draftFilters.priceRange[0]}
                  onChange={(event) => {
                    const value = Number(event.target.value.replace(/\D/g, "")) || 0;
                    setDraftFilters((current) => ({ ...current, priceRange: [value, current.priceRange[1]] }));
                  }}
                />
                <input
                  inputMode="numeric"
                  value={draftFilters.priceRange[1]}
                  onChange={(event) => {
                    const value = Number(event.target.value.replace(/\D/g, "")) || 0;
                    setDraftFilters((current) => ({ ...current, priceRange: [current.priceRange[0], value] }));
                  }}
                />
              </div>
            </div>

            <div className="filter-group">
              <h3>Цвет</h3>
              <div className="color-picker">
                {colorOptions.map((color) => (
                  <button
                    className={`color-swatch ${draftFilters.colors.includes(color.value) ? "active" : ""}`}
                    key={color.value}
                    type="button"
                    onClick={() => toggleColor(color.value)}
                    aria-label={color.label}
                    title={color.label}
                    style={{ "--swatch-color": color.color, backgroundColor: color.color } as CSSProperties}
                  />
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>Размер</h3>
              <div className="checkbox-list">
                {sizeOptions.map((size) => (
                  <label key={size} className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={draftFilters.sizes.includes(size)}
                      onChange={() => toggleSize(size)}
                    />
                    <span className="checkmark"><FiCheck /></span>
                    <span className="label-text">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              {hasFilterChanges && (
                <button className="apply-filters-btn" type="button" onClick={applyFilters}>
                  Применить
                </button>
              )}
              <button className="reset-filters-btn" type="button" onClick={clearFilters}>
                Сбросить фильтры <FiRefreshCw />
              </button>
            </div>
          </aside>

          <section className="favorites-content">
            <div className="favorites-toolbar">
              <label>
                <span>Сортировать:</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as SortValue)}>
                  <option value="added">по дате добавления</option>
                  <option value="priceAsc">сначала дешевле</option>
                  <option value="priceDesc">сначала дороже</option>
                  <option value="name">по названию</option>
                </select>
              </label>

              <div className="view-toggle" aria-label="Вид списка">
                <button
                  className={viewMode === "grid" ? "active" : ""}
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Сетка"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
                  </svg>
                </button>
                <button
                  className={viewMode === "compact" ? "active" : ""}
                  type="button"
                  onClick={() => setViewMode("compact")}
                  aria-label="Компактный вид"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M8 6h13" />
                    <path d="M8 12h13" />
                    <path d="M8 18h13" />
                    <path d="M3 6h.01" />
                    <path d="M3 12h.01" />
                    <path d="M3 18h.01" />
                  </svg>
                </button>
              </div>
            </div>

            {filteredFavorites.length > 0 ? (
              <div className={`favorites-grid ${viewMode}`}>
                {filteredFavorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h2>Ничего не найдено</h2>
                <p>Попробуйте изменить фильтры или очистить их.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
