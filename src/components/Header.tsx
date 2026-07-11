"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import AuthModal from "./AuthModal";
import "./Header.scss";

export default function Header() {
  const { data: session } = useSession();
  const { items } = useCart();
  const { favorites } = useFavorites();
  const pathname = usePathname();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo">
          <Link href="/">
            <img src="/campus-code-logo.svg" alt="Campus & Code" height="60" />
          </Link>
        </div>
        <nav className="navigation">
          <Link 
            href="/catalog" 
            className={`nav-link ${pathname?.startsWith('/catalog') || pathname?.startsWith('/product') ? 'active' : ''}`}
          >
            Каталог
          </Link>
          <Link href="/" className="nav-link">
            Университеты
          </Link>
          <Link href="/" className="nav-link">
            IT-мерч
          </Link>
          <Link href="/" className="nav-link">
            Новинки
          </Link>
          <Link href="/" className="nav-link">
            О нас
          </Link>
        </nav>
        <form
          className="search-form"
          role="search"
          onSubmit={handleSearchSubmit}
        >
          <input
            type="search"
            placeholder="Поиск по товарам"
            aria-label="Поиск по товарам"
          />
          <button type="submit" aria-label="Найти">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10.5 4a6.5 6.5 0 0 1 5.18 10.43l3.45 3.44a1 1 0 0 1-1.42 1.42l-3.44-3.45A6.5 6.5 0 1 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
            </svg>
          </button>
        </form>
        <nav className="user-navigation" aria-label="Пользовательское меню">
          {session ? (
            <div
              className="user-nav-link"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <span>
                {session.user?.name || session.user?.email?.split("@")[0]}
              </span>
              <button
                onClick={() => signOut()}
                style={{
                  background: "none",
                  border: "1px solid currentColor",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  color: "inherit",
                  fontSize: "0.8rem",
                }}
              >
                Выйти
              </button>
            </div>
          ) : (
            <>
              <button 
                className={`user-nav-link ${isProfilePopupOpen ? 'active' : ''}`}
                onClick={() => setIsProfilePopupOpen(true)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm0 9c-4.14 0-7.5 2.58-7.5 5.75 0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25C19.5 16.58 16.14 14 12 14Zm-5.38 5c.52-1.69 2.74-3 5.38-3s4.86 1.31 5.38 3H6.62Z" />
                </svg>
                <span>Профиль</span>
              </button>
              
              <AuthModal 
                isOpen={isProfilePopupOpen} 
                onClose={() => setIsProfilePopupOpen(false)} 
              />
            </>
          )}
          <Link href="/favorites" className="user-nav-link cart-link">
            <span className="cart-icon-wrapper">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21.35a1 1 0 0 1-.64-.23C5.2 15.98 2 12.74 2 8.75A5.73 5.73 0 0 1 7.75 3 6.27 6.27 0 0 1 12 4.75 6.27 6.27 0 0 1 16.25 3 5.73 5.73 0 0 1 22 8.75c0 3.99-3.2 7.23-9.36 12.37a1 1 0 0 1-.64.23ZM7.75 5A3.72 3.72 0 0 0 4 8.75c0 2.87 2.45 5.57 8 10.29 5.55-4.72 8-7.42 8-10.29A3.72 3.72 0 0 0 16.25 5a4.25 4.25 0 0 0-3.45 1.8 1 1 0 0 1-1.6 0A4.25 4.25 0 0 0 7.75 5Z" />
              </svg>
              {favorites.length > 0 && (
                <span className="cart-badge">{favorites.length}</span>
              )}
            </span>
            <span>Избранное</span>
          </Link>
          <Link href="/cart" className="user-nav-link cart-link">
            <span className="cart-icon-wrapper">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 18a2 2 0 1 0 .01 0H7Zm10 0a2 2 0 1 0 .01 0H17ZM6.2 6l1.13 6.78A3 3 0 0 0 10.29 15h5.67a3 3 0 0 0 2.84-2.05l1.07-3.22A2 2 0 0 0 17.98 7H7.12l-.24-1.45A3 3 0 0 0 3.92 3H3a1 1 0 0 0 0 2h.92a1 1 0 0 1 .99.84L6.2 13.1A5 5 0 0 0 11.12 17H18a1 1 0 1 0 0-2h-6.88a3 3 0 0 1-2.89-2.2L7.6 9h10.38l-1.08 3.32a1 1 0 0 1-.94.68h-5.67a1 1 0 0 1-.98-.84L8.56 7.7A1 1 0 0 0 7.57 7H6.2Z" />
              </svg>
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </span>
            <span>Корзина</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
