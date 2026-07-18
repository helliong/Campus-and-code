'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiGrid, FiList, FiChevronDown, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { LuShirt, LuBook, LuCoffee, LuShoppingBag, LuMonitor } from 'react-icons/lu';
import { PiHoodie, PiBaseballCap, PiSticker } from 'react-icons/pi';
import { getPublicItMerchProducts } from '../../actions/products';
import ProductCard from '../../components/ProductCard';
import type { Product } from '../../types';
import '../catalog/page.scss';
import './page.scss';

// Removed mockProducts

const topCategories = [
  { id: 'all', name: 'Все товары', icon: FiGrid },
  { id: 'clothing', name: 'Одежда', icon: LuShirt },
  { id: 'accessories', name: 'Аксессуары', icon: PiBaseballCap },
  { id: 'sticker', name: 'Стикеры', icon: PiSticker },
  { id: 'mug', name: 'Кружки', icon: LuCoffee },
  { id: 'bags', name: 'Сумки', icon: LuShoppingBag },
  { id: 'notebooks', name: 'Блокноты', icon: LuBook },
  { id: 'gadgets', name: 'Гаджеты', icon: LuMonitor },
];

const filterColors = [
  { id: 'white', hex: '#ffffff' },
  { id: 'beige', hex: '#e8e1d7' },
  { id: 'gray', hex: '#888888' },
  { id: 'blue', hex: '#3b82f6' },
  { id: 'darkblue', hex: '#1a365d' },
  { id: 'green', hex: '#2f4f4f' },
];

const filterSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const filterThemes = ['Разработка', 'Алгоритмы', 'DevOps', 'Frontend', 'Backend', 'Open Source'];

type FilterState = {
  category: string;
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  themes: string[];
};

const defaultFilters: FilterState = {
  category: 'all',
  priceRange: [0, 5000],
  colors: [],
  sizes: [],
  themes: []
};

export default function ITMerchPage() {
  const [draftFilters, setDraftFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(5000);

  React.useEffect(() => {
    getPublicItMerchProducts().then(data => {
      setProducts(data);
      const newMax = data.length > 0 ? Math.max(...data.map(p => p.price)) : 5000;
      setMaxPrice(newMax);
      setDraftFilters(prev => ({ ...prev, priceRange: [0, newMax] }));
      setAppliedFilters(prev => ({ ...prev, priceRange: [0, newMax] }));
      setLoading(false);
    });
  }, []);

  const hasChanges = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

  const applyFilters = () => setAppliedFilters(draftFilters);
  const resetFilters = () => {
    setDraftFilters({ ...defaultFilters, priceRange: [0, maxPrice] });
    setAppliedFilters({ ...defaultFilters, priceRange: [0, maxPrice] });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (appliedFilters.category !== 'all' && p.category !== appliedFilters.category) return false;
      if (p.price < appliedFilters.priceRange[0] || p.price > appliedFilters.priceRange[1]) return false;
      if (appliedFilters.colors.length > 0) {
        if (!p.availableColors || !p.availableColors.some((c: string) => appliedFilters.colors.includes(c))) return false;
      }
      if (appliedFilters.sizes.length > 0) {
        if (!p.availableSizes || !p.availableSizes.some((s: string) => appliedFilters.sizes.includes(s))) return false;
      }
      // Note: "themes" filtering logic could go here if the Product model had a tags/themes array
      if (appliedFilters.themes.length > 0) {
        if (!p.tags || !p.tags.some((t: string) => appliedFilters.themes.includes(t))) return false;
      }
      return true;
    });
  }, [products, appliedFilters]);

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return products.length;
    return products.filter(p => p.category === catId).length;
  };

  return (
    <main className="catalog-page">
      <div className="catalog-header-area">
        <div className="breadcrumbs">
          <Link href="/">Главная</Link>
          <FiChevronRight className="separator" />
          <span className="current">IT-мерч</span>
        </div>
        
        <div className="catalog-title-row">
          <div className="title-block">
            <h1>IT-мерч</h1>
            <p>Для тех, кто пишет код, решает задачи и меняет мир.</p>
          </div>
        </div>

        <div className="top-categories-scroll">
          <div className="top-categories-list">
            {topCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button 
                  key={cat.id} 
                  className={`top-category-btn ${draftFilters.category === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    const newFilters = { ...draftFilters, category: cat.id };
                    setDraftFilters(newFilters);
                    setAppliedFilters(newFilters);
                  }}
                >
                  <Icon className="cat-icon" />
                  <div className="cat-info">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-count">{getCategoryCount(cat.id)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="catalog-content-layout">
        <aside className="catalog-sidebar">
          <div className="filter-group">
            <h3>Категории</h3>
            <ul className="category-filter-list">
              {topCategories.map(cat => (
                <li 
                  key={`side-${cat.id}`} 
                  className={draftFilters.category === cat.id ? 'active' : ''}
                  onClick={() => {
                    const newFilters = { ...draftFilters, category: cat.id };
                    setDraftFilters(newFilters);
                    setAppliedFilters(newFilters);
                  }}
                >
                  <span className="name">{cat.name}</span>
                  <span className="count">{getCategoryCount(cat.id)}</span>
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
                max={maxPrice} 
                value={draftFilters.priceRange[0]} 
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), draftFilters.priceRange[1] - 100);
                  setDraftFilters(prev => ({ ...prev, priceRange: [val, prev.priceRange[1]] }));
                }}
              />
              <input 
                type="range" 
                className="range-input" 
                min={0} 
                max={maxPrice} 
                value={draftFilters.priceRange[1]} 
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), draftFilters.priceRange[0] + 100);
                  setDraftFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], val] }));
                }}
              />
              <div className="slider-track">
                <div 
                  className="slider-range" 
                  style={{ 
                    left: `${(draftFilters.priceRange[0] / maxPrice) * 100}%`, 
                    right: `${100 - (draftFilters.priceRange[1] / maxPrice) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="price-inputs">
              <input 
                type="text" 
                value={draftFilters.priceRange[0]} 
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                  setDraftFilters(prev => ({ ...prev, priceRange: [val, draftFilters.priceRange[1]] }));
                }}
              />
              <input 
                type="text" 
                value={draftFilters.priceRange[1]} 
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                  setDraftFilters(prev => ({ ...prev, priceRange: [draftFilters.priceRange[0], val] }));
                }}
              />
            </div>
          </div>

          <div className="filter-group">
            <h3>Цвет</h3>
            <div className="color-picker">
              {filterColors.map(color => (
                <button 
                  key={color.id} 
                  className={`color-swatch ${draftFilters.colors.includes(color.id) ? 'active' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Цвет ${color.id}`}
                  onClick={() => setDraftFilters(prev => ({
                    ...prev,
                    colors: prev.colors.includes(color.id) ? prev.colors.filter(c => c !== color.id) : [...prev.colors, color.id]
                  }))}
                />
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Размер</h3>
            <div className="checkbox-list">
              {filterSizes.map(size => (
                <label key={size} className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    checked={draftFilters.sizes.includes(size)}
                    onChange={() => setDraftFilters(prev => ({
                      ...prev,
                      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
                    }))}
                  />
                  <span className="checkmark"><FiCheck /></span>
                  <span className="label-text">{size}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Тема</h3>
            <div className="checkbox-list">
              {filterThemes.map(theme => (
                <label key={theme} className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    checked={draftFilters.themes.includes(theme)}
                    onChange={() => setDraftFilters(prev => ({
                      ...prev,
                      themes: prev.themes.includes(theme) ? prev.themes.filter(t => t !== theme) : [...prev.themes, theme]
                    }))}
                  />
                  <span className="checkmark"><FiCheck /></span>
                  <span className="label-text">{theme}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-actions">
            {hasChanges && (
              <button className="apply-filters-btn" onClick={applyFilters}>
                Применить
              </button>
            )}
            <button className="reset-filters-btn" onClick={resetFilters}>
              Сбросить фильтры <FiRefreshCw />
            </button>
          </div>
        </aside>

        <section className="catalog-main-area">
          <div className="catalog-toolbar">
            <div className="sort-dropdown">
              <button className="sort-btn">
                <span className="sort-text">
                  <span className="sort-label">Сортировать:</span> по популярности
                </span>
                <FiChevronDown />
              </button>
            </div>
            <div className="view-toggles">
              <button className="view-btn active"><FiGrid /></button>
              <button className="view-btn"><FiList /></button>
            </div>
          </div>

          <div className="catalog-product-grid">
            {loading ? (
              <p style={{ padding: '2rem' }}>Загрузка товаров...</p>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p style={{ padding: '2rem' }}>Товары не найдены.</p>
            )}
          </div>

          <div className="bottom-banners">
            <div className="banner dark-banner">
              <div className="banner-content">
                <h2>Мерч для разработчиков</h2>
                <p>Минимализм. Функциональность. Ты.</p>
                <Link href="#" className="banner-btn">Смотреть коллекцию &rarr;</Link>
              </div>
            </div>
            
            <div className="banner team-banner">
              <div className="banner-content">
                <h2>Для команд<br/>и стартапов</h2>
                <p>Кастомизация мерча<br/>с вашим логотипом.</p>
                <Link href="#" className="banner-btn">Узнать больше &rarr;</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
