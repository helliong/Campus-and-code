"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import OrderRowCard, { type OrderRowProps } from "@/components/OrderRowCard";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { getPublicProducts, getPublicUniversities } from "@/actions/products";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import "./page.scss";

// Mock data
const recentOrders: OrderRowProps[] = [];

export default function ProfilePage() {
  const { status, update } = useSession();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [profileData, setProfileData] = useState<any>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const { items } = useCart();
  const { isFavorite } = useFavorites();
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  const [universities, setUniversities] = useState<any[]>([]);
  useEffect(() => {
    getPublicProducts().then((data) => {
      setRecommendations(
        data
          .filter(
            (p) =>
              !items.some((i) => i.product.id === p.id) && !isFavorite(p.id),
          )
          .slice(0, 5),
      );
    });
    getPublicUniversities().then((data) => setUniversities(data));
  }, [items, isFavorite]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          setEditName(data.name || "");
          setEditPhone(data.phone || "");
          setEditEmail(data.email || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsProfileLoaded(true);
      }
    }
    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (!input) {
      setEditPhone("");
      return;
    }

    if (input.startsWith("9")) input = "7" + input;
    else if (input.startsWith("8")) input = "7" + input.substring(1);

    input = input.substring(0, 11);

    let formatted = "+";
    if (input.length > 0) formatted += input.substring(0, 1);
    if (input.length > 1) formatted += " (" + input.substring(1, 4);
    if (input.length > 4) formatted += ") " + input.substring(4, 7);
    if (input.length > 7) formatted += "-" + input.substring(7, 9);
    if (input.length > 9) formatted += "-" + input.substring(9, 11);

    setEditPhone(formatted);
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          email: editEmail,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        await update({
          user: {
            name: data.name,
            email: data.email,
          },
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = () => {
    if (status === "authenticated" && !isProfileLoaded) {
      return "CC";
    }

    const name = profileData?.name;
    const email = profileData?.email;
    if (name) {
      const parts = name.split(" ");
      if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return "US";
  };

  const isProfileLoading =
    status === "loading" || (status === "authenticated" && !isProfileLoaded);
  const displayName = isProfileLoading
    ? "Загрузка..."
    : profileData?.name || profileData?.email?.split("@")[0] || "Без имени";
  const displayEmail = isProfileLoading ? "" : profileData?.email;
  const displayPhone = isProfileLoading
    ? "Загрузка..."
    : profileData?.phone || "Телефон не указан";
  const displayRole =
    profileData?.role === "STUDENT"
      ? "Студент"
      : profileData?.role === "EXPLORER"
        ? "Исследователь"
        : profileData?.role || "Пользователь";

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
    }
  };

  const showVerificationBlock =
    profileData &&
    profileData.role !== "STUDENT" &&
    profileData.role !== "SUPERADMIN" &&
    profileData.role !== "UNIVERSITY_ADMIN";
  const pendingRequest = profileData?.verificationRequests?.[0];

  return (
    <div className="profile-overview-page">
      {/* Top Section */}
      <div className="top-blocks-grid">
        {/* User Info Card */}
        <div className="user-info-card">
          <div className="avatar-section">
            <div className="avatar-circle">
              {getInitials()}
              <button className="change-photo-btn" aria-label="Сменить фото">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h3l2-2h6l2 2h3c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 3c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
                </svg>
              </button>
            </div>
            <div className="user-details">
              {isEditing ? (
                <div className="edit-form-container">
                  <div className="input-group">
                    <label>Имя</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Email"
                    />
                  </div>
                  <div className="input-group">
                    <label>Телефон</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={handlePhoneChange}
                      placeholder="+7 (999) 000-00-00"
                    />
                  </div>
                  <div className="edit-actions">
                    <button onClick={handleSaveProfile} className="btn-save">
                      Сохранить
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-cancel"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {displayName}
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                      }}
                      aria-label="Редактировать"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </button>
                  </h2>
                  {displayEmail && <p className="email">{displayEmail}</p>}
                  <p className="phone">{displayPhone}</p>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <span className="badge-student">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="16"
                        height="16"
                      >
                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                      </svg>
                      {isProfileLoading ? "Загрузка..." : displayRole}
                    </span>
                    {profileData?.role === "STUDENT" &&
                      profileData?.university?.shortName && (
                        <span
                          className="badge-student"
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {profileData.university.shortName}
                        </span>
                      )}
                  </div>
                  {(profileData?.role === "SUPERADMIN" ||
                    profileData?.role === "UNIVERSITY_ADMIN") && (
                    <Link
                      href="/admin"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "#000",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        textDecoration: "none",
                        marginTop: "10px",
                        fontSize: "14px",
                        fontWeight: "500",
                        width: "fit-content",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Панель администратора
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Balance & Discount Block */}
        <div className="balances-card">
          <div className="balance-item">
            <span className="balance-label">Бонусный баланс</span>
            <span className="balance-value">0 ₽</span>
            <Link href="/profile/bonuses/history" className="balance-link">
              История бонусов &rarr;
            </Link>
          </div>
          <div className="balance-divider"></div>
          <div className="balance-item">
            <span className="balance-label">Скидка</span>
            <span className="balance-value">0%</span>
            <Link href="/profile/bonuses/rules" className="balance-link">
              Как это работает &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Student Verification Banner */}
      {showVerificationBlock && (
        <div
          className="stats-card verification-banner"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem 2rem",
            background: "var(--bg-card)",
            border: "1px solid var(--accent-color)",
            borderRadius: "12px",
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "1.2rem",
                color: "var(--text-main)",
              }}
            >
              Получить статус студента
            </h3>

            {pendingRequest && pendingRequest.status === "PENDING" ? (
              <p style={{ margin: 0, color: "#ff9800", fontSize: "0.9rem" }}>
                Ваша заявка находится на рассмотрении.
              </p>
            ) : pendingRequest && pendingRequest.status === "REJECTED" ? (
              <p style={{ margin: 0, color: "#ff4757", fontSize: "0.9rem" }}>
                Заявка отклонена. Загрузите фото повторно.
              </p>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Подтвердите, что вы студент, чтобы получить скидку 10% и другие
                бонусы.
              </p>
            )}
          </div>
          <Link
            href="/verify"
            style={{
              padding: "0.8rem 1.5rem",
              background: "var(--accent-color)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 500,
            }}
          >
            Подтвердить статус
          </Link>
        </div>
      )}

      {/* Statistics Block */}
      <div className="stats-card">
        <div className="stat-item">
          <div className="stat-icon-wrapper">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">0</span>
            <span className="stat-label">Заказов</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper stat-ruble-icon">₽</div>
          <div className="stat-info">
            <span className="stat-value">0 ₽</span>
            <span className="stat-label">Потрачено</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">0 ₽</span>
            <span className="stat-label">Бонусов</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M5 11V5a2 2 0 012-2h10a2 2 0 012 2v6M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">0</span>
            <span className="stat-label">Университета</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12z" />
              <path d="M4 22v-7" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">0</span>
            <span className="stat-label">Подписки</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders-section">
        <div className="section-header">
          <h3>Последние заказы</h3>
          <Link href="/profile/orders" className="view-all-link">
            Смотреть все заказы &rarr;
          </Link>
        </div>
        <div className="orders-list">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <OrderRowCard key={order.id} {...order} />
            ))
          ) : (
            <div className="orders-empty-state">
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
              <div className="empty-content">
                <h4>У вас пока нет заказов</h4>
                <p>
                  Когда вы оформите первый заказ, он появится здесь вместе со
                  статусом доставки и деталями.
                </p>
              </div>
              <Link href="/catalog" className="empty-action">
                Перейти в каталог
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Block */}
      <div className="recommended-section">
        <h3>Рекомендовано для вас</h3>
        <div className="carousel-container">
          {canScrollLeft && (
            <button
              className="carousel-nav-btn left"
              onClick={scrollLeft}
              aria-label="Листать влево"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}

          <div
            className="recommendations-grid"
            ref={scrollRef}
            onScroll={checkScroll}
          >
            {recommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {canScrollRight && (
            <button
              className="carousel-nav-btn right"
              onClick={scrollRight}
              aria-label="Листать вправо"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
