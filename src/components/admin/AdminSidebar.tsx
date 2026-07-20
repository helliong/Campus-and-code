"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import { signOutAndClearUserState } from "@/lib/auth/signOut";
import {
  FiActivity,
  FiArchive,
  FiCheckSquare,
  FiFileText,
  FiGift,
  FiHome,
  FiImage,
  FiLogOut,
  FiMail,
  FiMessageSquare,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";

type AdminNavigationItem = {
  label: string;
  icon: IconType;
  href?: string;
};

const navigationItems: AdminNavigationItem[] = [
  { label: "Главная", icon: FiHome, href: "/admin" },
  { label: "Товары", icon: FiPackage, href: "/admin/products" },
  { label: "Категории", icon: FiArchive },
  { label: "Заказы", icon: FiShoppingBag, href: "/admin/orders" },
  { label: "Пользователи", icon: FiUsers, href: "/admin/users" },
  { label: "Заявки на статус", icon: FiCheckSquare, href: "/admin/verifications" },
  { label: "Отзывы", icon: FiMessageSquare },
  { label: "Бонусы и скидки", icon: FiGift },
  { label: "Страницы", icon: FiFileText },
  { label: "Баннеры", icon: FiImage },
  { label: "Рассылки", icon: FiMail },
  { label: "Настройки", icon: FiSettings },
  { label: "Журнал действий", icon: FiActivity, href: "/admin/activity" },
];

function isNavigationItemActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname.startsWith(href);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-logo">
        <span>Панель</span>
        <span>Администратора</span>
      </Link>

      <nav className="admin-nav" aria-label="Навигация панели администратора">
        {navigationItems.map(({ label, icon: Icon, href }) => {
          if (!href) {
            return (
              <span
                className="admin-nav-link upcoming"
                aria-disabled="true"
                title="Раздел в разработке"
                key={label}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </span>
            );
          }

          return (
            <Link
              href={href}
              className={`admin-nav-link ${isNavigationItemActive(pathname, href) ? "active" : ""}`}
              key={href}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="admin-logout"
        onClick={() => void signOutAndClearUserState()}
      >
        <FiLogOut aria-hidden="true" />
        <span>Выйти</span>
      </button>
    </aside>
  );
}
