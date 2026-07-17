"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { mockProducts } from "@/lib/mockData";
import { generateSlug } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { getPublicProducts } from "@/actions/products";
import { getStudentDiscountAmount, STUDENT_DISCOUNT_PERCENT } from "@/lib/pricing";
import { getProductImagesForColor } from "@/lib/productVariants";
import "./page.scss";

const colorNames: Record<string, string> = {
  black: "Черный",
  white: "Натуральный",
  blue: "Темно-синий",
  gray: "Серый",
};

type UserProfile = {
  role?: string | null;
};

function formatPrice(price: number) {
  return `${price.toLocaleString("ru-RU")} ₽`;
}

function getProductUrl(product: Product, options?: { color?: string; size?: string }) {
  const url = `/product/${product.id}-${generateSlug(product.name)}`;
  const params = new URLSearchParams();

  if (options?.color) params.set("color", options.color);
  if (options?.size) params.set("size", options.size);

  const query = params.toString();
  return query ? `${url}?${query}` : url;
}

function getCartItemImage(item: { product: Product; selectedColor?: string }) {
  return getProductImagesForColor(item.product, item.selectedColor)[0] || item.product.imageUrl;
}

function getItemsWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return "товар";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100))
    return "товара";
  return "товаров";
}

export default function CartPage() {
  const {
    items,
    addToCart,
    updateQuantity,
    clearCart,
    cartTotal,
    toggleItemSelection,
    toggleAllSelection,
  } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const emptyRecommendationsRef = useRef<HTMLDivElement>(null);
  const [canScrollRecommendationsLeft, setCanScrollRecommendationsLeft] =
    useState(false);
  const [canScrollRecommendationsRight, setCanScrollRecommendationsRight] =
    useState(false);
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(data => setProfileData(data))
        .catch(console.error);
    }
  }, [status]);

  const isStudent = session?.user?.role === "STUDENT" || profileData?.role === "STUDENT";
  const studentDiscountPct = 10;
  const discountAmount = isStudent ? Math.floor((cartTotal * studentDiscountPct) / 100) : 0;
  const selectedItems = items.filter((item) => item.isSelected !== false);
  const totalSelectedItems = selectedItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const isAllSelected =
    items.length > 0 && items.every((item) => item.isSelected !== false);
  const totalToPay = cartTotal - discountAmount;
  const [publicProducts, setPublicProducts] = useState<Product[]>([]);

  useEffect(() => {
    getPublicProducts().then((data) => setPublicProducts(data));
  }, []);

  const recommendations = publicProducts
    .filter((product) => !items.some((item) => item.product.id === product.id))
    .slice(0, 5);
  const shouldShowInlineRecommendations = totalItems < 5;
  const sidebarRecommendations = shouldShowInlineRecommendations
    ? []
    : recommendations.slice(0, 2);

  const handleRecommendedCart = (product: Product) => {
    addToCart(
      product,
      1,
      product.availableSizes?.[0],
      product.availableColors?.[0],
    );
  };

  const handleFavoriteToggle = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
      return;
    }

    addFavorite(product);
  };

  const checkRecommendationsScroll = () => {
    const element = emptyRecommendationsRef.current;
    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;
    const hasOverflow = scrollWidth > clientWidth + 1;

    setCanScrollRecommendationsLeft(hasOverflow && scrollLeft > 0);
    setCanScrollRecommendationsRight(
      hasOverflow && Math.ceil(scrollLeft + clientWidth) < scrollWidth,
    );
  };

  const scrollEmptyRecommendations = (direction: "left" | "right") => {
    emptyRecommendationsRef.current?.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    checkRecommendationsScroll();
    window.addEventListener("resize", checkRecommendationsScroll);

    return () =>
      window.removeEventListener("resize", checkRecommendationsScroll);
  }, [recommendations.length]);

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <nav className="cart-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span>&gt;</span>
          <span>Корзина</span>
        </nav>

        <section className="cart-empty">
          <div className="empty-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h1>Корзина пуста</h1>
          <p>Добавьте товары из каталога, и они появятся здесь.</p>
          <Link href="/catalog" className="primary-action">
            Перейти в каталог
          </Link>
        </section>

        {recommendations.length > 0 && (
          <section className="empty-recommendations" aria-label="Рекомендации">
            <h2>Рекомендовано для вас</h2>
            <div className="empty-recommendation-carousel">
              {canScrollRecommendationsLeft && (
                <button
                  className="recommendation-nav left"
                  type="button"
                  onClick={() => scrollEmptyRecommendations("left")}
                  aria-label="Листать рекомендации влево"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}

              <div
                className="empty-recommendation-list"
                ref={emptyRecommendationsRef}
                onScroll={checkRecommendationsScroll}
              >
                {recommendations.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {canScrollRecommendationsRight && (
                <button
                  className="recommendation-nav right"
                  type="button"
                  onClick={() => scrollEmptyRecommendations("right")}
                  aria-label="Листать рекомендации вправо"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="cart-page">
      <nav className="cart-breadcrumbs" aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span>&gt;</span>
        <span>Корзина</span>
      </nav>

      <header className="cart-header">
        <h1>Корзина</h1>
        <p>
          Выбрано: {totalSelectedItems} {getItemsWord(totalSelectedItems)} на
          сумму {formatPrice(cartTotal)}
        </p>
      </header>

      <div className="cart-layout">
        <div className="cart-main-column">
          <section className="cart-items-card" aria-label="Товары в корзине">
            <div className="cart-select-all">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => toggleAllSelection(e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Выбрать все</span>
              </label>
            </div>
            <div className="cart-table-head">
              <span>Товар</span>
              <span>Цена</span>
              <span>Количество</span>
              <span>Сумма</span>
            </div>

            <div className="cart-list">
              {items.map((item) => {
                const rowKey = `${item.product.id}-${item.selectedSize || "none"}-${item.selectedColor || "none"}`;
                const productUrl = getProductUrl(item.product, {
                  color: item.selectedColor,
                  size: item.selectedSize,
                });
                const rowTotal = item.product.price * item.quantity;
                const productImage = getCartItemImage(item);

                return (
                  <article className="cart-row" key={rowKey}>
                    <label className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={item.isSelected !== false}
                        onChange={() =>
                          toggleItemSelection(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor,
                          )
                        }
                      />
                      <span className="checkbox-custom"></span>
                    </label>
                    <Link href={productUrl} className="cart-product-image">
                      <Image
                        src={productImage}
                        alt={item.product.name}
                        width={132}
                        height={132}
                        unoptimized
                      />
                    </Link>

                    <div className="cart-product-info">
                      <Link href={productUrl} className="cart-product-title">
                        {item.product.name}
                      </Link>
                      <div className="cart-product-options">
                        {item.selectedColor && (
                          <span>
                            Цвет:{" "}
                            {colorNames[item.selectedColor] ||
                              item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span>Размер: {item.selectedSize}</span>
                        )}
                      </div>
                    </div>

                    <span className="cart-price">
                      {formatPrice(item.product.price)}
                    </span>

                    <div
                      className="quantity-control"
                      aria-label={`Количество ${item.product.name}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1,
                            item.selectedSize,
                            item.selectedColor,
                          )
                        }
                        aria-label="Уменьшить количество"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1,
                            item.selectedSize,
                            item.selectedColor,
                          )
                        }
                        aria-label="Увеличить количество"
                      >
                        +
                      </button>
                    </div>

                    <span className="cart-row-total">
                      {formatPrice(rowTotal)}
                    </span>

                    <div className="cart-row-actions">
                      <button
                        className={`cart-favorite-btn ${isFavorite(item.product.id) ? "active" : ""}`}
                        type="button"
                        onClick={() => handleFavoriteToggle(item.product)}
                        aria-label={
                          isFavorite(item.product.id)
                            ? "Убрать из избранного"
                            : "Добавить в избранное"
                        }
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 21.35a1 1 0 0 1-.64-.23C5.2 15.98 2 12.74 2 8.75A5.73 5.73 0 0 1 7.75 3 6.27 6.27 0 0 1 12 4.75 6.27 6.27 0 0 1 16.25 3 5.73 5.73 0 0 1 22 8.75c0 3.99-3.2 7.23-9.36 12.37a1 1 0 0 1-.64.23Z" />
                        </svg>
                      </button>
                      <button
                        className="remove-row"
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            0,
                            item.selectedSize,
                            item.selectedColor,
                          )
                        }
                        aria-label="Удалить товар"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              className="clear-cart-btn"
              type="button"
              onClick={clearCart}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
              Очистить корзину
            </button>
          </section>
        </div>

        <aside className="cart-sidebar" aria-label="Итоги заказа">
          <section className="summary-card">
            <h2>Итого</h2>
            <div className="summary-lines">
              <div>
                <span>
                  {totalSelectedItems} {getItemsWord(totalSelectedItems)}
                </span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <div>
                <span>
                  Скидка {isStudent ? `(Студент ${STUDENT_DISCOUNT_PERCENT}%)` : ""}
                </span>
                <strong style={{ color: isStudent ? "#10b981" : "inherit" }}>
                  {discountAmount > 0
                    ? `- ${formatPrice(discountAmount)}`
                    : "- 0 ₽"}
                </strong>
              </div>
            </div>
            <div className="summary-total">
              <span>К оплате</span>
              <strong>{formatPrice(totalToPay)}</strong>
            </div>
            {selectedItems.length > 0 ? (
              <Link className="checkout-btn" href="/checkout">
                Оформить заказ
              </Link>
            ) : (
              <button className="checkout-btn disabled" disabled>
                Выберите товары
              </button>
            )}
            <button
              className="quick-buy-btn"
              type="button"
              disabled={selectedItems.length === 0}
            >
              Купить в пару кликов
            </button>
          </section>

          <section className="benefits-card" aria-label="Преимущества">
            <div className="benefit-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 7h11v10H3z" />
                <path d="M14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />
              </svg>
              <div>
                <strong>Бесплатная доставка</strong>
                <span>По России при заказе от 3 000 ₽</span>
              </div>
            </div>
            <div className="benefit-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              <div>
                <strong>Возврат и обмен</strong>
                <span>В течение 14 дней</span>
              </div>
            </div>
            <div className="benefit-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <div>
                <strong>Поддержка 24/7</strong>
                <span>Мы всегда на связи</span>
              </div>
            </div>
          </section>

          {sidebarRecommendations.length > 0 && (
            <section className="cart-recommendations">
              <h2>Вам может понравиться</h2>
              <div className="recommendation-list">
                {sidebarRecommendations.map((product) => (
                  <article className="recommendation-card" key={product.id}>
                    <button
                      className={`favorite-btn ${isFavorite(product.id) ? "active" : ""}`}
                      type="button"
                      onClick={() => handleFavoriteToggle(product)}
                      aria-label={
                        isFavorite(product.id)
                          ? "Убрать из избранного"
                          : "Добавить в избранное"
                      }
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21.35a1 1 0 0 1-.64-.23C5.2 15.98 2 12.74 2 8.75A5.73 5.73 0 0 1 7.75 3 6.27 6.27 0 0 1 12 4.75 6.27 6.27 0 0 1 16.25 3 5.73 5.73 0 0 1 22 8.75c0 3.99-3.2 7.23-9.36 12.37a1 1 0 0 1-.64.23Z" />
                      </svg>
                    </button>
                    <Link
                      href={getProductUrl(product)}
                      className="recommendation-image"
                    >
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={190}
                        height={128}
                        unoptimized
                      />
                    </Link>
                    <Link
                      href={getProductUrl(product)}
                      className="recommendation-title"
                    >
                      {product.name}
                    </Link>
                    <div className="recommendation-footer">
                      <strong>{formatPrice(product.price)}</strong>
                      <button
                        className="recommendation-cart"
                        type="button"
                        onClick={() => handleRecommendedCart(product)}
                        aria-label="Добавить в корзину"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      {shouldShowInlineRecommendations && recommendations.length > 0 && (
        <section
          className="cart-inline-recommendations"
          aria-label="Рекомендации"
        >
          <h2>Вам может понравиться</h2>
          <div className="empty-recommendation-carousel">
            {canScrollRecommendationsLeft && (
              <button
                className="recommendation-nav left"
                type="button"
                onClick={() => scrollEmptyRecommendations("left")}
                aria-label="Листать рекомендации влево"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            <div
              className="empty-recommendation-list"
              ref={emptyRecommendationsRef}
              onScroll={checkRecommendationsScroll}
            >
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {canScrollRecommendationsRight && (
              <button
                className="recommendation-nav right"
                type="button"
                onClick={() => scrollEmptyRecommendations("right")}
                aria-label="Листать рекомендации вправо"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
