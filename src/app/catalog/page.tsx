'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FiChevronRight, FiGrid, FiList, FiChevronDown, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { LuShirt, LuBook, LuCoffee, LuShoppingBag, LuTerminal } from 'react-icons/lu';
import { PiHoodie, PiBaseballCap, PiSticker } from 'react-icons/pi';
import { getPublicProducts } from '../../actions/products';
import ProductCard from '../../components/ProductCard';
import './page.scss';

const baseTopCategories = [
  { id: 'all', name: 'Все товары', icon: FiGrid },
  { id: 'hoodie', name: 'Худи', icon: PiHoodie },
  { id: 'tshirt', name: 'Футболки', icon: LuShirt },
  { id: 'sticker', name: 'Стикеры', icon: PiSticker },
  { id: 'accessories', name: 'Аксессуары', icon: PiBaseballCap }, 
  { id: 'mug', name: 'Кружки', icon: LuCoffee },
  { id: 'other', name: 'Разное', icon: LuShoppingBag },
];

const filterColors = [
  { id: 'white', hex: '#ffffff' },
  { id: 'beige', hex: '#e8e1d7' },
  { id: 'blue', hex: '#b3d4e5' },
  { id: 'darkblue', hex: '#1a365d' },
  { id: 'green', hex: '#2f4f4f' },
  { id: 'black', hex: '#111111' },
];

const filterSizes = ['S', 'M', 'L', 'XL'];
const filterMaterials = ['Хлопок', 'Футер', 'Полиэстер', 'Керамика', 'Металл', 'Бумага', 'Холст'];

type FilterState = {
  category: string;
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  materials: string[];
  inStock: boolean;
};

const defaultFilters: FilterState = {
  category: 'all',
  priceRange: [0, 5000],
  colors: [],
  sizes: [],
  materials: [],
  inStock: false
};

function CatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Read initial category from URL
  const initialCategory = searchParams.get('category') || 'all';

  // Filters state
  const [draftFilters, setDraftFilters] = useState<FilterState>({ ...defaultFilters, category: initialCategory });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({ ...defaultFilters, category: initialCategory });

  // Update URL when applied category changes
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [maxPriceLimit, setMaxPriceLimit] = useState(5000);

  useEffect(() => {
    getPublicProducts().then(data => {
      setProducts(data);
      const newMax = data.length > 0 ? Math.max(...data.map(p => p.price)) : 5000;
      setMaxPriceLimit(newMax);
      setDraftFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], newMax] }));
      setAppliedFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], newMax] }));
      setLoadingProducts(false);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (appliedFilters.category !== 'all') {
      params.set('category', appliedFilters.category);
    } else {
      params.delete('category');
    }
    
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [appliedFilters.category, pathname, router]);

  const hasChanges = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

  const toggleColor = (id: string) => {
    setDraftFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(id) ? prev.colors.filter(c => c !== id) : [...prev.colors, id]
    }));
  };
  
  const toggleSize = (size: string) => {
    setDraftFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };
  
  const toggleMaterial = (material: string) => {
    setDraftFilters(prev => ({
      ...prev,
      materials: prev.materials.includes(material) ? prev.materials.filter(m => m !== material) : [...prev.materials, material]
    }));
  };
  
  const applyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters({ ...defaultFilters, priceRange: [0, maxPriceLimit] });
    setAppliedFilters({ ...defaultFilters, priceRange: [0, maxPriceLimit] });
  };

  // Instant apply for top category buttons (optional, but good UX)
  const handleTopCategoryClick = (id: string) => {
    const newFilters = { ...draftFilters, category: id };
    setDraftFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  // Drag logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    if (Math.abs(x - startX) > 5) {
      setDragMoved(true);
    }
    
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (appliedFilters.category !== 'all' && product.category !== appliedFilters.category) return false;
      
      if (product.price < appliedFilters.priceRange[0] || product.price > appliedFilters.priceRange[1]) return false;

      if (appliedFilters.colors.length > 0) {
        if (!product.availableColors || !product.availableColors.some((c: string) => appliedFilters.colors.includes(c))) return false;
      }
      
      if (appliedFilters.sizes.length > 0) {
        if (!product.availableSizes || !product.availableSizes.some((s: string) => appliedFilters.sizes.includes(s))) return false;
      }
      
      if (appliedFilters.materials.length > 0) {
        if (!product.materials || !product.materials.some((m: string) => appliedFilters.materials.includes(m))) return false;
      }
      
      if (appliedFilters.inStock && !product.inStock) return false;
      
      return true;
    });
  }, [appliedFilters, products]);

  const topCategories = useMemo(() => {
    return baseTopCategories.map(cat => {
      if (cat.id === 'all') return { ...cat, count: products.length };
      return { ...cat, count: products.filter(p => p.category === cat.id).length };
    });
  }, [products]);

  return (
    <main className="catalog-page">
      <div className="catalog-header-area">
        <div className="breadcrumbs">
          <Link href="/">Главная</Link>
          <FiChevronRight className="separator" />
          <span className="current">Каталог</span>
        </div>
        
        <div className="catalog-title-row">
          <div className="title-block">
            <h1>Каталог</h1>
            <p>Мерч для тех, кто учится, кодит и создаёт.</p>
          </div>
          <div className="products-count">
            Показано: {filteredProducts.length} товаров
          </div>
        </div>

        <div 
          className={`top-categories-scroll ${isDragging ? 'dragging' : ''}`}
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="top-categories-list">
            {topCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button 
                  key={cat.id} 
                  className={`top-category-btn ${draftFilters.category === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    if (!dragMoved) {
                      handleTopCategoryClick(cat.id);
                    }
                  }}
                >
                  <Icon className="cat-icon" />
                  <div className="cat-info">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-count">{cat.count}</span>
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
                  onClick={() => handleTopCategoryClick(cat.id)}
                >
                  <span className="name">{cat.name}</span>
                  <span className="count">{cat.count}</span>
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
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), draftFilters.priceRange[1] - 100);
                  setDraftFilters(prev => ({ ...prev, priceRange: [val, prev.priceRange[1]] }));
                }}
              />
              <input 
                type="range" 
                className="range-input" 
                min={0} 
                max={maxPriceLimit} 
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
                    left: `${(draftFilters.priceRange[0] / maxPriceLimit) * 100}%`, 
                    right: `${100 - (draftFilters.priceRange[1] / maxPriceLimit) * 100}%` 
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
                  setDraftFilters(prev => ({ ...prev, priceRange: [val, prev.priceRange[1]] }));
                }}
              />
              <input 
                type="text" 
                value={draftFilters.priceRange[1]} 
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                  setDraftFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], val] }));
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
                  onClick={() => toggleColor(color.id)}
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
                    onChange={() => toggleSize(size)}
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
              {filterMaterials.map(material => (
                <label key={material} className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    checked={draftFilters.materials.includes(material)}
                    onChange={() => toggleMaterial(material)}
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
                  onChange={(e) => setDraftFilters(prev => ({ ...prev, inStock: e.target.checked }))}
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
            {loadingProducts ? (
               <p style={{ padding: '2rem' }}>Загрузка товаров...</p>
            ) : filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>

          {!loadingProducts && filteredProducts.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              По вашему запросу ничего не найдено.
            </div>
          )}

          {!loadingProducts && filteredProducts.length > 0 && (
            <div className="catalog-pagination">
              <button className="page-btn prev"><FiChevronRight style={{transform: 'rotate(180deg)'}} /></button>
              <button className="page-btn active">1</button>
              <button className="page-btn next"><FiChevronRight /></button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Загрузка каталога...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
