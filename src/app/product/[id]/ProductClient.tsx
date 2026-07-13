"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockProducts } from "../../../lib/mockData";
import { generateSlug } from "../../../lib/utils";
function RelatedProductCard({ product, customStyle, customContent }: { product: Product, customStyle: any, customContent: React.ReactNode }) {
  const { items, addToCart, updateQuantity } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  const favorite = isFavorite(product.id);
  const cartItem = items.find(item => item.product.id === product.id && !item.selectedSize && !item.selectedColor);
  // Note: For simple products like mugs/stickers we might not have size/color. 
  // If we want to safely match, let's just match by ID for these related products.
  const matchedCartItem = items.find(item => item.product.id === product.id);
  const quantity = matchedCartItem ? matchedCartItem.quantity : 0;
  
  const handleFavoriteToggle = () => {
    if (favorite) removeFavorite(product.id);
    else addFavorite(product);
  };
  
  const handleAddToCart = () => {
    addToCart(product, 1);
  };
  
  const handleIncrement = () => {
    if (matchedCartItem) updateQuantity(product.id, quantity + 1, matchedCartItem.selectedSize, matchedCartItem.selectedColor);
  };
  
  const handleDecrement = () => {
    if (matchedCartItem) updateQuantity(product.id, quantity - 1, matchedCartItem.selectedSize, matchedCartItem.selectedColor);
  };

  const categoryNames: Record<string, string> = {
    hoodie: "Худи", tshirt: "Футболки", sticker: "Стикеры", accessories: "Аксессуары", mug: "Кружки", other: "Разное"
  };

  const productUrl = `/product/${product.id}-${generateSlug(product.name)}`;

  return (
    <div className="product-card">
      <button className={`fav-btn ${favorite ? 'active' : ''}`} onClick={handleFavoriteToggle}>
        <FiHeart style={favorite ? { fill: '#ff4757', color: '#ff4757' } : {}} />
      </button>
      <Link href={productUrl} className="card-img" style={{...customStyle, display: 'block', textDecoration: 'none'}}>
        {customContent}
      </Link>
      <div className="card-info">
        <span className="card-cat">{categoryNames[product.category] || "Разное"}</span>
        <Link href={productUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="card-title">{product.name}</span>
        </Link>
        <div className="card-bottom">
          <span className="card-price">{product.price.toLocaleString("ru-RU")} ₽</span>
          {quantity > 0 ? (
            <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', height: '32px', width: '80px' }}>
              <button onClick={handleDecrement} style={{ width: '28px', height: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
              <span style={{ flex: 1, textAlign: 'center', color: 'var(--text-main)', fontSize: '0.9rem' }}>{quantity}</span>
              <button onClick={handleIncrement} style={{ width: '28px', height: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          ) : (
            <button className="cart-btn" onClick={handleAddToCart} style={{ height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <FiShoppingCart />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
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

export default function ProductClient({ product }: { product: Product }) {
  const { items, addToCart, updateQuantity } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const favorite = isFavorite(product.id);

  const sizesToRender = product.availableSizes || [];
  const [sizeState, setSizeState] = useState(sizesToRender[0] || "");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const colorsMap: Record<string, string> = {
    black: "#1A1A1A",
    blue: "#1C2331",
    white: "#F5F5F5",
    gray: "#A9A9A9",
    beige: "#EADDD7",
  };

  const colorsToRender = product.availableColors || [
    "blue",
    "black",
    "gray",
    "beige",
  ];
  const [colorState, setColorState] = useState(colorsToRender[0] || "blue");

  const [activeTab, setActiveTab] = useState<
    "desc" | "specs" | "delivery" | "reviews"
  >("desc");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const cartItem = items.find(
    (item) =>
      item.product.id === product.id &&
      item.selectedSize === sizeState &&
      item.selectedColor === colorState,
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1, sizeState, colorState);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1, sizeState, colorState);
  };

  const handleAddToCart = () => {
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
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`thumb ${activeImageIdx === idx ? "active" : ""}`}
                  onClick={() => setActiveImageIdx(idx)}
                >
                  <div
                    className="img-placeholder"
                    style={{
                      backgroundImage: "var(--product-image-gradient)",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="main-image-container">
              <div className="badge">NEW</div>
              <button className="favorite-btn" onClick={handleFavoriteToggle}>
                <FiHeart
                  style={{
                    fill: favorite ? "#ff4757" : "transparent",
                    color: favorite ? "#ff4757" : "inherit",
                  }}
                />
              </button>
              <div className="main-image-placeholder"></div>
              <div className="image-nav">
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) => Math.max(0, prev - 1))
                  }
                >
                  <FiChevronLeft />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) => Math.min(3, prev + 1))
                  }
                >
                  <FiChevronRight />
                </button>
              </div>
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
                <FiStar className="star filled" style={{ fill: "currentColor" }} />
                <FiStar className="star filled" style={{ fill: "currentColor" }} />
                <FiStar className="star filled" style={{ fill: "currentColor" }} />
                <FiStar className="star filled" style={{ fill: "currentColor" }} />
                <FiStar
                  className="star half"
                  style={{ fill: "url(#halfGradient)" }}
                />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="halfGradient">
                      <stop offset="50%" stopColor="var(--text-main)" />
                      <stop
                        offset="50%"
                        stopColor="transparent"
                        stopOpacity="1"
                      />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="score">4.9</span>
                <span className="reviews">(128 отзывов)</span>
              </div>
              <span className="art">Арт. CC-HOOD-001</span>
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
                  {sizesToRender.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${sizeState === size ? "active" : ""}`}
                      onClick={() => setSizeState(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="actions">
              {quantity > 0 ? (
                <div className="quantity-controls-main">
                  <button className="qty-btn" onClick={handleDecrement}>-</button>
                  <span className="qty-value">В корзине ({quantity} шт)</span>
                  <button className="qty-btn" onClick={handleIncrement}>+</button>
                </div>
              ) : (
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  <FiShoppingCart /> Добавить в корзину
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
              Отзывы (128)
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
                <li>
                  Материал:{" "}
                  {product.materials?.join(", ") || "80% хлопок, 20% полиэстер"}
                </li>
                <li>Плотность: 320 г/м²</li>
                <li>Принт: стойкий, не трескается и не выцветает</li>
                <li>Карман-кенгуру, капюшон на шнурках</li>
                <li>Унисекс модель</li>
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

        <div className="related-products">
          <h2>С этим товаром покупают</h2>
          <div className="products-grid">
            {[
              {
                id: '11',
                customStyle: { backgroundImage: "var(--product-image-gradient)" },
                customContent: (
                  <div className="placeholder" style={{ color: "var(--text-main)", fontSize: "1rem", fontFamily: "monospace" }}>
                    {"{"} code {"}"}<br />mode
                  </div>
                )
              },
              {
                id: '6',
                customStyle: { backgroundImage: "radial-gradient(circle at center, #dcd1c6, #c5b8ab)" },
                customContent: (
                  <div className="placeholder" style={{ color: "#000", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}>
                    CODE<br />MODE<br /><span style={{ fontSize: "0.8rem" }}>&lt;/&gt;</span>
                  </div>
                )
              },
              {
                id: '4',
                customStyle: { backgroundImage: "var(--product-image-gradient)" },
                customContent: (
                  <div className="placeholder" style={{ color: "var(--text-main)", fontSize: "1rem" }}>Developer</div>
                )
              },
              {
                id: '12',
                customStyle: { backgroundImage: "radial-gradient(circle at center, #222, #000)" },
                customContent: (
                  <div className="placeholder" style={{ color: "#d4af37", fontSize: "1rem", textAlign: "center" }}>
                    CODE<br />PLAN<br />BUILD<br />REPEAT
                  </div>
                )
              },
              {
                id: '10',
                customStyle: { backgroundImage: "var(--product-image-gradient)" },
                customContent: (
                  <div className="placeholder" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                    <span style={{ background: "var(--text-main)", color: "var(--bg-card)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>git commit</span>
                    <span style={{ background: "var(--bg-card)", color: "var(--text-main)", padding: "0.2rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.8rem", fontFamily: "monospace" }}>{"{"} code {"}"}<br />mode</span>
                  </div>
                )
              }
            ].map((data) => {
              const p = mockProducts.find(p => p.id === data.id);
              if (!p) return null;
              return (
                <RelatedProductCard 
                  key={p.id}
                  product={p} 
                  customStyle={data.customStyle} 
                  customContent={data.customContent} 
                />
              );
            })}
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
                    <tr><td>XXL</td><td>64–66</td><td>74–76</td><td>69–71</td></tr>
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
      </main>
    </div>
  );
}
