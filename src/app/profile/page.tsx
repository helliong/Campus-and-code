"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import OrderRowCard from "@/components/OrderRowCard";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import "./page.scss";

// Mock data
const mockOrders = [
  {
    id: "1",
    orderNumber: "10245",
    date: "16 мая, 2024",
    status: "delivered" as const,
    itemCount: 3,
    totalPrice: 3690,
    imageUrl: "/category-hoodie-premium.png",
  },
  {
    id: "2",
    orderNumber: "10201",
    date: "8 мая, 2024",
    status: "delivered" as const,
    itemCount: 2,
    totalPrice: 1880,
    imageUrl: "/category-tshirt-premium.png",
  },
  {
    id: "3",
    orderNumber: "10177",
    date: "25 апреля, 2024",
    status: "in_transit" as const,
    itemCount: 1,
    totalPrice: 690,
    imageUrl: "/category-mug-premium.png", // Assuming mug image
  },
  {
    id: "4",
    orderNumber: "10123",
    date: "12 апреля, 2024",
    status: "cancelled" as const,
    itemCount: 2,
    totalPrice: 1780,
    imageUrl: "/category-accessories-premium.png", // Assuming bag/tote image
  },
];

const mockRecommendations: Product[] = [
  {
    id: "rec1",
    name: "Худи Keep Calm and Code",
    description: "Мягкое худи для долгих сессий кодинга",
    category: "hoodie",
    price: 3690,
    imageUrl: "/category-hoodie-premium.png",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["black"],
  },
  {
    id: "rec2",
    name: "Кружка Code Mode",
    description: "Керамическая кружка",
    category: "mug",
    price: 690,
    imageUrl: "/category-mug-premium.png",
  },
  {
    id: "rec3",
    name: "Стикерпак Dev",
    description: "Набор виниловых наклеек",
    category: "sticker",
    price: 390,
    imageUrl: "/category-stickers-premium.png",
  },
  {
    id: "rec4",
    name: "Кепка Developer",
    description: "Стильная черная кепка",
    category: "accessories",
    price: 990,
    imageUrl: "/category-accessories-premium.png",
  },
  {
    id: "rec5",
    name: "Блокнот Code Plan",
    description: "Ежедневник для программистов",
    category: "other",
    price: 590,
    imageUrl: "/category-university-premium.png", // Or generic placeholder
  },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [profileData, setProfileData] = useState<{name?: string, email?: string, phone?: string, role?: string} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          setEditName(data.name || "");
          setEditPhone(data.phone || "");
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = () => {
    const name = profileData?.name || session?.user?.name;
    const email = profileData?.email || session?.user?.email;
    if (name) {
      const parts = name.split(" ");
      if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return "US";
  };
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
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
                <div className="edit-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    placeholder="Имя"
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card-soft)', color: 'var(--text-main)', width: '100%', minWidth: '200px' }}
                  />
                  <input 
                    type="text" 
                    value={editPhone} 
                    onChange={e => setEditPhone(e.target.value)} 
                    placeholder="Телефон"
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card-soft)', color: 'var(--text-main)', width: '100%' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={handleSaveProfile} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'var(--primary-text)', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Сохранить</button>
                    <button onClick={() => setIsEditing(false)} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-secondary)', borderRadius: '4px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.9rem' }}>Отмена</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {profileData?.name || session?.user?.name || session?.user?.email?.split('@')[0] || 'Без имени'}
                    <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} aria-label="Редактировать">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  </h2>
                  <p className="email">{profileData?.email || session?.user?.email}</p>
                  <p className="phone">{profileData?.phone || "Телефон не указан"}</p>
                  <span className="badge-student">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                    </svg>
                    {profileData?.role === 'student' ? 'Студент' : (profileData?.role || 'Пользователь')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Balance & Discount Block */}
        <div className="balances-card">
          <div className="balance-item">
            <span className="balance-label">Бонусный баланс</span>
            <span className="balance-value">1 240 ₽</span>
            <Link href="/profile/bonuses/history" className="balance-link">
              История бонусов &rarr;
            </Link>
          </div>
          <div className="balance-divider"></div>
          <div className="balance-item">
            <span className="balance-label">Скидка</span>
            <span className="balance-value">10%</span>
            <Link href="/profile/bonuses/rules" className="balance-link">
              Как это работает &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Block */}
      <div className="stats-card">
        <div className="stat-item">
          <div className="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">12</span>
            <span className="stat-label">Заказов</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">6 570 ₽</span>
            <span className="stat-label">Потрачено</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">1 240 ₽</span>
            <span className="stat-label">Бонусов</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M5 11V5a2 2 0 012-2h10a2 2 0 012 2v6M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">4</span>
            <span className="stat-label">Университета</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12z" />
              <path d="M4 22v-7" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">3</span>
            <span className="stat-label">Подписки</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Block */}
      <div className="recent-orders-card">
        <div className="orders-header">
          <h3>Последние заказы</h3>
          <Link href="/profile/orders" className="view-all-link">
            Смотреть все заказы &rarr;
          </Link>
        </div>
        <div className="orders-list">
          {mockOrders.map((order) => (
            <OrderRowCard key={order.id} {...order} />
          ))}
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}
          
          <div className="recommendations-grid" ref={scrollRef} onScroll={checkScroll}>
            {mockRecommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {canScrollRight && (
            <button 
              className="carousel-nav-btn right" 
              onClick={scrollRight}
              aria-label="Листать вправо"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
