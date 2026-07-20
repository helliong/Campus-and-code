"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { generateSlug } from "@/lib/shared/utils";
import ProductCard from "@/components/product/ProductCard";
import { getPublicProducts } from "../../../actions/products";
import {
  FiChevronRight,
  FiChevronLeft,
  FiShare2,
  FiStar,
  FiHeart,
  FiShoppingCart,
  FiTruck,
  FiClock,
  FiRefreshCcw,
  FiPenTool,
  FiFeather,
  FiBookOpen,
  FiMaximize,
  FiX,
  FiInfo,
} from "react-icons/fi";
import { useCart } from "../../../context/CartContext";
import { useFavorites } from "../../../context/FavoritesContext";
import { Product } from "../../../types";
import {
  getAvailableSizesForColor,
  getProductAvailableStock,
  getProductImagesForColor,
  hasVariantStock,
} from "@/lib/products/productVariants";

type ProductClientProps = {
  product: Product;
  initialVariant?: {
    color?: string;
    size?: string;
  };
};

export default function ProductClient({ product, initialVariant }: ProductClientProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const favorite = isFavorite(product.id);

  const sizesToRender = product.availableSizes || [];
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const colorsMap: Record<string, string> = {
    black: "#1A1A1A",
    blue: "#1C2331",
    white: "#F5F5F5",
    gray: "#A9A9A9",
    beige: "#EADDD7",
    red: "#E63946",
    green: "#2A9D8F",
  };

  const colorsToRender = product.availableColors || [
    "blue",
    "black",
    "gray",
    "beige",
  ];
  const initialColor =
    initialVariant?.color && colorsToRender.includes(initialVariant.color)
      ? initialVariant.color
      : colorsToRender[0] || "blue";
  const initialAvailableSizes = getAvailableSizesForColor(product, initialColor);
  const initialSize =
    initialVariant?.size &&
    sizesToRender.includes(initialVariant.size) &&
    (!initialAvailableSizes.length || initialAvailableSizes.includes(initialVariant.size))
      ? initialVariant.size
      : initialAvailableSizes[0] || sizesToRender[0] || "";
  const [sizeState, setSizeState] = useState(initialSize);
  const [colorState, setColorState] = useState(initialColor);

  const [activeTab, setActiveTab] = useState<
    "desc" | "specs" | "delivery" | "reviews"
  >("desc");
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  
  const imagesList = useMemo(
    () => getProductImagesForColor(product, colorState),
    [product, colorState],
  );
  const availableSizesForColor = useMemo(
    () => getAvailableSizesForColor(product, colorState),
    [product, colorState],
  );
  const isSelectedVariantInStock = hasVariantStock(product, colorState, sizeState || undefined);

  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    getPublicProducts().then(data => {
      setRecommendations(data.filter(p => p.id !== product.id && !items.some(i => i.product.id === p.id) && !isFavorite(p.id)).slice(0, 4));
    });
  }, [items, isFavorite, product.id]);

  useEffect(() => {
    setActiveImageIdx(0);

    if (availableSizesForColor.length > 0 && !availableSizesForColor.includes(sizeState)) {
      setSizeState(availableSizesForColor[0]);
    }
  }, [colorState, availableSizesForColor, sizeState]);

  const cartItem = items.find(
    (item) =>
      item.product.id === product.id &&
      item.selectedSize === sizeState &&
      item.selectedColor === colorState,
  );
  const quantity = cartItem ? cartItem.quantity : 0;
  const availableStock = getProductAvailableStock(product, colorState, sizeState);
  const isAtStockLimit = quantity >= availableStock;

  const handleIncrement = () => {
    if (!isSelectedVariantInStock) return;
    updateQuantity(product.id, quantity + 1, sizeState, colorState);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1, sizeState, colorState);
  };

  const handleAddToCart = () => {
    if (!isSelectedVariantInStock) return;

    if (quantity > 0) {
      updateQuantity(product.id, quantity + 1, sizeState, colorState);
    } else {
      addToCart(product, 1, sizeState, colorState);
    }
  };

  const handleFavoriteToggle = () => {
    if (favorite) removeFavorite(product.id);
    else addFavorite(product);
  };

  const categoryNames: Record<string, string> = {
    hoodie: "Худи",
    tshirt: "Футболки",
    sticker: "Стикеры",
    accessories: "Аксессуары",
    mug: "Кружки",
    other: "Разное",
  };
  const categoryName = categoryNames[product.category] || "Товары";

  const formattedPrice = product.price.toLocaleString("ru-RU");

  return (
    <div className="product-page-wrapper">
      <main className="product-detail-page">
        <div className="product-header-area">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link>
            <FiChevronRight className="separator" />
            <Link href="/catalog">Каталог</Link>
            <FiChevronRight className="separator" />
            <Link href={`/catalog?category=${product.category}`}>
              {categoryName}
            </Link>
            <FiChevronRight className="separator" />
            <span className="current">{product.name}</span>
          </div>
        </div>

        <div className="product-main">
          {/* Left Side: Images */}
          <div className="product-gallery">
            <div className="thumbnails">
              {imagesList.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={`thumb ${activeImageIdx === idx ? "active" : ""}`}
                  onClick={() => setActiveImageIdx(idx)}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  <Image src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} fill style={{ objectFit: 'cover' }} sizes="80px" unoptimized />
                </div>
              ))}
            </div>
            <div className="main-image-container">
              <Image
                src={imagesList[activeImageIdx]}
                alt={product.name}
                fill
                className="main-product-image"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
              <div className="badge" style={{ zIndex: 10 }}>NEW</div>
              <button className="favorite-btn" onClick={handleFavoriteToggle} style={{ zIndex: 10 }}>
                <FiHeart
                  style={{
                    fill: favorite ? "#ff4757" : "transparent",
                    color: favorite ? "#ff4757" : "inherit",
                  }}
                />
              </button>
              {imagesList.length > 1 && (
                <div className="image-nav" style={{ zIndex: 10 }}>
                  <button
                    onClick={() =>
                      setActiveImageIdx((prev) => Math.max(0, prev - 1))
                    }
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIdx((prev) => Math.min(imagesList.length - 1, prev + 1))
                    }
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="product-info">
            <div className="info-top">
              <span className="category-label">{categoryName}</span>
              <button className="share-btn">
                <FiShare2 /> Поделиться
              </button>
            </div>

            <h1 className="product-title">{product.name}</h1>

            <div className="product-meta">
              <div className="rating">
                <FiStar className="star" />
                <FiStar className="star" />
                <FiStar className="star" />
                <FiStar className="star" />
                <FiStar className="star" />
                <span className="score">0.0</span>
                <span className="reviews">(0 отзывов)</span>
              </div>
              <span className="art">Арт. {product.sku || 'Не указан'}</span>
            </div>

            <div className="price-block">
              <span className="price">{formattedPrice} ₽</span>
            </div>

            <div className="color-selection">
              <p>
                Цвет:{" "}
                <span>
                  {colorState === "blue" ? "Тёмно-синий" : colorState}
                </span>
              </p>
              <div className="colors">
                {colorsToRender.map((color) => (
                  <button
                    key={color}
                    className={`color-btn ${colorState === color ? "active" : ""}`}
                    style={{ backgroundColor: colorsMap[color] || "#111" }}
                    onClick={() => setColorState(color)}
                  />
                ))}
              </div>
            </div>

            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="size-selection">
                <div className="size-header">
                  <p>Размер:</p>
                  <button className="size-guide-btn" onClick={() => setIsSizeGuideOpen(true)}>
                    <FiMaximize /> Таблица размеров
                  </button>
                </div>
                <div className="sizes">
                  {sizesToRender.map((size) => {
                    const isSizeAvailable = hasVariantStock(product, colorState, size);

                    return (
                      <button
                        key={size}
                        className={`size-btn ${sizeState === size ? "active" : ""}`}
                        disabled={!isSizeAvailable}
                        onClick={() => setSizeState(size)}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="actions">
              {quantity > 0 ? (
                <div className="quantity-controls-main">
                  <button className="qty-btn" onClick={handleDecrement}>-</button>
                  <span className="qty-value">В корзине ({quantity} шт)</span>
                  <button className="qty-btn" onClick={handleIncrement} disabled={isAtStockLimit} aria-label={isAtStockLimit ? "Достигнут доступный остаток" : "Увеличить количество"}>+</button>
                </div>
              ) : (
                <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={!isSelectedVariantInStock}>
                  <FiShoppingCart /> {isSelectedVariantInStock ? "Добавить в корзину" : "Нет в наличии"}
                </button>
              )}
              <button className="quick-buy-btn">
                <span className="lightning">⚡</span> Купить в пару кликов
              </button>
            </div>

            <div className="delivery-info">
              <div className="info-item">
                <FiTruck className="info-icon" />
                <div className="info-text">
                  <strong>Бесплатная доставка</strong>
                  <span>По России при заказе от 3 000 ₽</span>
                </div>
              </div>
              <div className="info-item">
                <FiClock className="info-icon" />
                <div className="info-text">
                  <strong>Отправим завтра</strong>
                  <span>При заказе до 16:00</span>
                </div>
              </div>
              <div className="info-item">
                <FiRefreshCcw className="info-icon" />
                <div className="info-text">
                  <strong>Лёгкий возврат</strong>
                  <span>В течение 14 дней</span>
                </div>
              </div>
            </div>

            <div className="why-us">
              <h3>Почему выбирают нас</h3>
              <div className="why-item">
                <FiFeather className="why-icon" />
                <div className="why-text">
                  <strong>Качественные материалы</strong>
                  <span>Только премиальные ткани и фурнитура</span>
                </div>
              </div>
              <div className="why-item">
                <FiPenTool className="why-icon" />
                <div className="why-text">
                  <strong>Уникальный дизайн</strong>
                  <span>Создано студентами и разработчиками</span>
                </div>
              </div>
              <div className="why-item">
                <FiBookOpen className="why-icon" />
                <div className="why-text">
                  <strong>Поддержка студентов</strong>
                  <span>Часть прибыли идёт в образовательные проекты</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="product-description-tabs">
          <div className="tabs-header">
            <button
              className={`tab ${activeTab === "desc" ? "active" : ""}`}
              onClick={() => setActiveTab("desc")}
            >
              Описание
            </button>
            <button
              className={`tab ${activeTab === "specs" ? "active" : ""}`}
              onClick={() => setActiveTab("specs")}
            >
              Характеристики
            </button>
            <button
              className={`tab ${activeTab === "delivery" ? "active" : ""}`}
              onClick={() => setActiveTab("delivery")}
            >
              Доставка и оплата
            </button>
            <button
              className={`tab ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Отзывы (0)
            </button>
          </div>
          <div className="tab-content">
            {activeTab === "desc" && (
              <p>
                {product.description ||
                  "Минималистичный худи для тех, кто живёт кодом и не перестаёт учиться. Мягкий, тёплый и удобный — идеально для учёбы, работы и отдыха."}
              </p>
            )}
            {activeTab === "specs" && (
              <ul>
                {product.materials && product.materials.length > 0 ? (
                  product.materials.map((spec, idx) => (
                    <li key={idx}>{spec}</li>
                  ))
                ) : (
                  <li>Характеристики не указаны</li>
                )}
              </ul>
            )}
            {activeTab === "delivery" && (
              <p>
                Доставка осуществляется курьерскими службами и почтой России.
                Стоимость доставки рассчитывается индивидуально.
              </p>
            )}
            {activeTab === "reviews" && (
              <p>Здесь пока нет отзывов. Вы можете стать первым!</p>
            )}
          </div>
        </div>



        {isSizeGuideOpen && (
          <div className="size-guide-overlay" onClick={() => setIsSizeGuideOpen(false)}>
            <div className="size-guide-modal" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setIsSizeGuideOpen(false)}>
                <FiX />
              </button>
              <h2>Таблица размеров</h2>
              <p className="subtitle">{product.name}</p>
              
              <div className="table-wrapper">
                <p className="table-title">Размеры {product.category === 'hoodie' ? 'худи' : 'футболки'} (см)</p>
                <table>
                  <thead>
                    <tr>
                      <th>Размер</th>
                      <th>Ширина груди (A)</th>
                      <th>Длина изделия (B)</th>
                      <th>Длина рукава (C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>S</td><td>52–54</td><td>66–68</td><td>61–63</td></tr>
                    <tr><td>M</td><td>55–57</td><td>68–70</td><td>63–65</td></tr>
                    <tr><td>L</td><td>58–60</td><td>70–72</td><td>65–67</td></tr>
                    <tr><td>XL</td><td>61–63</td><td>72–74</td><td>67–69</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="guide-details">
                <div className="guide-illustration">
                  {product.category === 'hoodie' ? (
                    <>
                      <Image
                        src="/size-guide-hoodie-light.webp"
                        alt="Схема замеров худи"
                        width={320}
                        height={320}
                        className="guide-illustration-image guide-illustration-image--light"
                      />
                      <Image
                        src="/size-guide-hoodie-transparent.webp"
                        alt="Схема замеров худи"
                        width={320}
                        height={320}
                        className="guide-illustration-image guide-illustration-image--dark"
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src="/size-guide-tshirt-light.webp"
                        alt="Схема замеров футболки"
                        width={320}
                        height={320}
                        className="guide-illustration-image guide-illustration-image--light"
                      />
                      <Image
                        src="/size-guide-tshirt-transparent.webp"
                        alt="Схема замеров футболки"
                        width={320}
                        height={320}
                        className="guide-illustration-image guide-illustration-image--dark"
                      />
                    </>
                  )}
                </div>
                <div className="guide-legend">
                  <div className="legend-item">
                    <span className="legend-marker">A</span>
                    <div className="legend-text">
                      <h4>Ширина груди</h4>
                      <p>Измерьте расстояние между подмышечными впадинами по самой широкой части груди.</p>
                    </div>
                  </div>
                  <div className="legend-item">
                    <span className="legend-marker">B</span>
                    <div className="legend-text">
                      <h4>Длина изделия</h4>
                      <p>Измерьте длину от самой высокой точки плеча до нижнего края изделия.</p>
                    </div>
                  </div>
                  <div className="legend-item">
                    <span className="legend-marker">C</span>
                    <div className="legend-text">
                      <h4>Длина рукава</h4>
                      <p>Измерьте длину рукава от плечевого шва до конца манжеты.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="guide-footer">
                <FiInfo />
                <div className="footer-text">
                  <strong>Допустимое отклонение: ±1–2 см</strong>
                  <p>Размер может незначительно отличаться в зависимости от модели.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <section className="related-products" style={{ marginTop: '4rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>С этим товаром покупают</h2>
            <div className="related-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {recommendations.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
