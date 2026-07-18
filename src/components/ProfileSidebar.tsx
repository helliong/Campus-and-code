"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FiHeadphones } from "react-icons/fi";
import "./ProfileSidebar.scss";

export default function ProfileSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/profile", label: "Обзор", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" }, // Dashboard-like
    { href: "/profile/orders", label: "Мои заказы", icon: "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h5v-2h-5v2zm0-4h5v-2h-5v2zm0-4h5V7h-5v2zM7 7h3v2H7V7zm0 4h3v2H7v-2zm0 4h3v2H7v-2z" },
    { href: "/favorites", label: "Избранное", icon: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" },
    { href: "/profile/data", label: "Личные данные", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
    { href: "/profile/address", label: "Адреса доставки", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" },
    { href: "/profile/payment", label: "Способы оплаты", icon: "M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" },
    { href: "/profile/notifications", label: "Подписки и уведомления", icon: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" },
    { href: "/profile/bonuses", label: "Бонусы и скидки", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h5v-2h-5v2zm-5-4h10v-2H7v2zm0-4h10V7H7v2z" }, // Changed to list since there's no generic bonus icon, but will adjust
    { href: "/profile/security", label: "Безопасность", icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" },
    { href: "/profile/support", label: "Поддержка", icon: "M12 1a9 9 0 00-9 9v7a3 3 0 003 3h3v-8H5v-2a7 7 0 0114 0v2h-4v8h4v1h-7v2h7a3 3 0 003-3V10a9 9 0 00-9-9z" },
  ];

  return (
    <aside className="profile-sidebar">
      <nav className="profile-nav">
        <ul>
          {navItems.map((item) => {
            // For exact match on '/profile'
            const isActive = item.href === '/profile' 
              ? pathname === '/profile' 
              : pathname?.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="item-icon">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="sidebar-footer">
          <button onClick={() => signOut({ callbackUrl: '/' })} className="logout-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="item-icon">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Выйти
          </button>
        </div>
      </nav>

      <div className="sidebar-support">
        <h2>Нужна помощь?</h2>
        <p>Свяжитесь с нашей поддержкой, если у вас возникли вопросы по заказу.</p>
        <Link
          href="/profile/support#chat"
          className="support-link"
          onClick={(event) => {
            if (pathname !== "/profile/support") return;

            event.preventDefault();
            window.history.replaceState(null, "", "/profile/support#chat");
            window.dispatchEvent(new Event("support-chat:open"));
          }}
        >
          <FiHeadphones aria-hidden="true" />
          Связаться в чате
        </Link>
      </div>
    </aside>
  );
}
