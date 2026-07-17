"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FiBox,
  FiCreditCard,
  FiLock,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiShield,
  FiSmartphone,
  FiTruck,
} from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import {
  getStudentDiscountAmount,
  STUDENT_DISCOUNT_PERCENT,
} from "@/lib/pricing";
import { getProductImagesForColor } from "@/lib/productVariants";
import { CartItem } from "@/types";
import "./page.scss";

type UserProfile = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
};

type DeliveryOption = {
  id: "courier" | "post" | "cdek";
  title: string;
  description: string;
  price: number;
  time: string;
  icon: "truck" | "box" | "package";
};

type PaymentOption = {
  id: "card" | "sbp" | "on-delivery";
  title: string;
  description: string;
  commission?: string;
  icon: "card" | "phone";
  disabled?: boolean;
  disabledReason?: string;
};

const colorNames: Record<string, string> = {
  black: "Черный",
  white: "Натуральный",
  blue: "Темно-синий",
  gray: "Серый",
};

const deliveryOptions: DeliveryOption[] = [
  {
    id: "courier",
    title: "Курьером по городу",
    description: "Доставка курьером до двери",
    price: 290,
    time: "1-2 дня",
    icon: "truck",
  },
  {
    id: "post",
    title: "Почта России",
    description: "Доставка в отделение Почты России",
    price: 390,
    time: "3-5 дней",
    icon: "box",
  },
  {
    id: "cdek",
    title: "СДЭК",
    description: "Доставка в пункт выдачи СДЭК",
    price: 350,
    time: "2-4 дня",
    icon: "package",
  },
];

const paymentOptions: PaymentOption[] = [
  {
    id: "card",
    title: "Банковской картой онлайн",
    description: "Visa, Mastercard, МИР",
    commission: "Без комиссии",
    icon: "card",
  },
  {
    id: "sbp",
    title: "СБП - оплата по QR",
    description: "Оплата через систему быстрых платежей",
    commission: "Без комиссии",
    icon: "phone",
  },
  {
    id: "on-delivery",
    title: "Картой при получении",
    description: "Оплата наличными или картой курьеру",
    commission: "Недоступно",
    icon: "card",
    disabled: true,
    disabledReason: "Этот способ оплаты временно недоступен",
  },
];

function formatPrice(price: number) {
  return `${price.toLocaleString("ru-RU")} ₽`;
}

function getCartItemImage(item: CartItem) {
  return (
    getProductImagesForColor(item.product, item.selectedColor)[0] ||
    item.product.imageUrl
  );
}

function getItemsWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return "товар";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100))
    return "товара";
  return "товаров";
}

function DeliveryIcon({ icon }: { icon: DeliveryOption["icon"] }) {
  if (icon === "truck") return <FiTruck aria-hidden="true" />;
  if (icon === "box") return <FiBox aria-hidden="true" />;
  return <FiPackage aria-hidden="true" />;
}

function PaymentIcon({ icon }: { icon: PaymentOption["icon"] }) {
  if (icon === "phone") return <FiSmartphone aria-hidden="true" />;
  return <FiCreditCard aria-hidden="true" />;
}

export default function CheckoutPage() {
  const { items: allItems, cartTotal } = useCart();
  const items = allItems.filter((item) => item.isSelected !== false);
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoadState, setProfileLoadState] = useState<
    "idle" | "loaded" | "error"
  >("idle");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [selectedDeliveryId, setSelectedDeliveryId] =
    useState<DeliveryOption["id"]>("courier");
  const [selectedPaymentId, setSelectedPaymentId] =
    useState<PaymentOption["id"]>("card");
  const [city, setCity] = useState("Екатеринбург");
  const [comment, setComment] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isAgreementAccepted, setIsAgreementAccepted] = useState(true);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const selectedDelivery = useMemo(
    () =>
      deliveryOptions.find((option) => option.id === selectedDeliveryId) ??
      deliveryOptions[0],
    [selectedDeliveryId],
  );
  const isStudent =
    session?.user?.role === "STUDENT" || profile?.role === "STUDENT";
  const discount = isStudent ? getStudentDiscountAmount(cartTotal) : 0;
  const totalToPay = cartTotal + selectedDelivery.price - discount;
  const isProfileLoading =
    status === "authenticated" && profileLoadState === "idle";

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let isMounted = true;

    fetch("/api/user/profile")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Profile request failed");
        }

        return response.json() as Promise<UserProfile>;
      })
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setCheckoutEmail(data.email ?? "");
          setCheckoutPhone(data.phone ?? "");
          setProfileLoadState("loaded");
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile(null);
          setProfileLoadState("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [status]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (!input || input === "7") {
      setCheckoutPhone("+7 ");
      return;
    }

    if (input.startsWith("9")) input = "7" + input;
    else if (input.startsWith("8")) input = "7" + input.substring(1);
    else if (!input.startsWith("7")) input = "7" + input;

    input = input.substring(0, 11);

    let formatted = "+";
    if (input.length > 0) formatted += input.substring(0, 1);
    if (input.length > 1) formatted += " (" + input.substring(1, 4);
    if (input.length > 4) formatted += ") " + input.substring(4, 7);
    if (input.length > 7) formatted += "-" + input.substring(7, 9);
    if (input.length > 9) formatted += "-" + input.substring(9, 11);

    setCheckoutPhone(formatted);
  };

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <nav className="checkout-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span>&gt;</span>
          <Link href="/cart">Корзина</Link>
          <span>&gt;</span>
          <span>Оформление заказа</span>
        </nav>

        <section className="checkout-empty">
          <div className="checkout-empty-icon" aria-hidden="true">
            <FiPackage />
          </div>
          <h1>Корзина пуста</h1>
          <p>Добавьте товары в корзину, чтобы перейти к оформлению заказа.</p>
          <Link href="/catalog" className="checkout-primary-link">
            Перейти в каталог
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <nav className="checkout-breadcrumbs" aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span>&gt;</span>
        <Link href="/cart">Корзина</Link>
        <span>&gt;</span>
        <span>Оформление заказа</span>
      </nav>

      <header className="checkout-header">
        <h1>Оформление заказа</h1>
        <p>Заполните данные и выберите способ доставки и оплаты</p>
      </header>

      <div className="checkout-layout">
        <div className="checkout-main">
          <section className="checkout-card">
            <div className="checkout-section-title">
              <span>1.</span>
              <h2>Контактные данные</h2>
            </div>

            {status === "unauthenticated" ? (
              <div className="checkout-auth-note">
                <p>
                  Войдите в аккаунт, чтобы использовать контактные данные из
                  профиля.
                </p>
                <Link href="/login">Войти</Link>
              </div>
            ) : (
              <div className="contact-grid">
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={isProfileLoading ? "Загрузка..." : checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    disabled={isProfileLoading}
                  />
                </label>
                <label>
                  <span>Телефон</span>
                  <input
                    type="tel"
                    value={isProfileLoading ? "Загрузка..." : checkoutPhone}
                    onChange={handlePhoneChange}
                    disabled={isProfileLoading}
                    placeholder="+7 (999) 000-00-00"
                  />
                </label>
              </div>
            )}
          </section>

          <section className="checkout-card">
            <div className="checkout-section-title">
              <span>2.</span>
              <h2>Доставка</h2>
            </div>

            <label className="checkout-field">
              <span>Город, улица, дом, квартира</span>
              <span className="city-input-wrap">
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Екатеринбург, ул. Ленина, 1, кв. 2"
                />
                <FiMapPin aria-hidden="true" />
              </span>
            </label>

            <div className="option-list">
              {deliveryOptions.map((option) => (
                <button
                  className={`checkout-option ${selectedDeliveryId === option.id ? "active" : ""}`}
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedDeliveryId(option.id)}
                >
                  <span className="radio-mark" aria-hidden="true" />
                  <span className="option-icon">
                    <DeliveryIcon icon={option.icon} />
                  </span>
                  <span className="option-content">
                    <strong>{option.title}</strong>
                    <small>{option.description}</small>
                  </span>
                  <span className="option-meta">
                    <strong>{formatPrice(option.price)}</strong>
                    <small>{option.time}</small>
                  </span>
                </button>
              ))}
            </div>

            <label className="checkout-field">
              <span>Комментарий к заказу (необязательно)</span>
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Например, удобное время доставки или другие пожелания"
              />
            </label>
          </section>

          <section className="checkout-card">
            <div className="checkout-section-title">
              <span>3.</span>
              <h2>Способ оплаты</h2>
            </div>

            <div className="option-list">
              {paymentOptions.map((option) => (
                <button
                  className={`checkout-option ${selectedPaymentId === option.id ? "active" : ""} ${option.disabled ? "disabled" : ""}`}
                  key={option.id}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      setSelectedPaymentId(option.id);
                    }
                  }}
                >
                  <span className="radio-mark" aria-hidden="true" />
                  <span className="option-icon">
                    <PaymentIcon icon={option.icon} />
                  </span>
                  <span className="option-content">
                    <strong>{option.title}</strong>
                    <small>{option.description}</small>
                    {option.disabledReason && (
                      <small>{option.disabledReason}</small>
                    )}
                  </span>
                  {option.commission && (
                    <span className="option-badge">{option.commission}</span>
                  )}
                </button>
              ))}
            </div>

            <label className="agreement-row">
              <input
                type="checkbox"
                checked={isAgreementAccepted}
                onChange={(event) =>
                  setIsAgreementAccepted(event.target.checked)
                }
              />
              <span>
                Я согласен с{" "}
                <Link href="/profile">
                  условиями Пользовательского соглашения
                </Link>{" "}
                и <Link href="/profile">Политикой конфиденциальности</Link>
              </span>
            </label>
          </section>
        </div>

        <aside className="checkout-sidebar" aria-label="Итоги заказа">
          <section className="checkout-card order-card">
            <div className="order-card-header">
              <h2>Ваш заказ</h2>
              <Link href="/cart">Изменить</Link>
            </div>

            <div className="order-list">
              {items.map((item) => {
                const rowKey = `${item.product.id}-${item.selectedSize || "none"}-${item.selectedColor || "none"}`;
                const productImage = getCartItemImage(item);

                return (
                  <article className="order-item" key={rowKey}>
                    <div className="order-item-image">
                      <Image
                        src={productImage}
                        alt={item.product.name}
                        width={76}
                        height={76}
                        unoptimized
                      />
                    </div>
                    <div className="order-item-info">
                      <h3>{item.product.name}</h3>
                      {item.selectedColor && (
                        <span>
                          Цвет:{" "}
                          {colorNames[item.selectedColor] || item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && (
                        <span>Размер: {item.selectedSize}</span>
                      )}
                      <span>{item.quantity} шт.</span>
                    </div>
                    <strong>
                      {formatPrice(item.product.price * item.quantity)}
                    </strong>
                  </article>
                );
              })}
            </div>

            <div className="promo-row">
              <input
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Промокод"
              />
              <button type="button">Применить</button>
            </div>

            <div className="summary-lines">
              <div>
                <span>
                  Товары ({totalItems} {getItemsWord(totalItems)})
                </span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <div>
                <span>Доставка</span>
                <strong>{formatPrice(selectedDelivery.price)}</strong>
              </div>
              <div>
                <span>
                  Скидка{" "}
                  {isStudent ? `(Студент ${STUDENT_DISCOUNT_PERCENT}%)` : ""}
                </span>
                <strong>- {formatPrice(discount)}</strong>
              </div>
            </div>

            <div className="checkout-total">
              <span>Итого</span>
              <strong>{formatPrice(totalToPay)}</strong>
            </div>

            <button
              className="pay-button"
              type="button"
              disabled={!isAgreementAccepted || status !== "authenticated"}
            >
              <FiLock aria-hidden="true" />
              Перейти к оплате
            </button>

            <p className="payment-note">
              Нажимая на кнопку, вы переходите к безопасной оплате и
              подтверждаете заказ
            </p>
          </section>

          <section className="checkout-card benefits-card">
            <div className="benefit-item">
              <FiShield aria-hidden="true" />
              <div>
                <strong>Безопасная оплата</strong>
                <span>Ваши данные защищены и не передаются третьим лицам</span>
              </div>
            </div>
            <div className="benefit-item">
              <FiTruck aria-hidden="true" />
              <div>
                <strong>Быстрая доставка</strong>
                <span>Доставим заказ в срок и с отслеживанием</span>
              </div>
            </div>
            <div className="benefit-item">
              <FiRefreshCw aria-hidden="true" />
              <div>
                <strong>Легкий возврат</strong>
                <span>Вернем деньги, если товар не подошел</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
