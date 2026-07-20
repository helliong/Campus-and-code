"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import AuthModal from "@/components/auth/AuthModal";
import ProductSearch from "@/components/product/ProductSearch";
import "./Header.scss";

export default function Header() {
  const { data: session } = useSession();
  const { items } = useCart();
  const { favorites } = useFavorites();
  const pathname = usePathname();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const isHomeActive = pathname === "/";
  const isCatalogActive = pathname?.startsWith('/catalog') || pathname?.startsWith('/product');
  const isUniversitiesActive = pathname?.startsWith('/universities');
  const isFavoritesActive = pathname?.startsWith('/favorites');
  const isCartActive = pathname?.startsWith('/cart') || pathname?.startsWith('/checkout');
  const isProfileActive = isProfilePopupOpen || pathname?.startsWith('/login') || pathname?.startsWith('/register');

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo">
          <Link href="/">
            <img src="/campus-code-logo.svg" alt="Campus & Code" height="60" />
          </Link>
        </div>
        <nav className="navigation">
          <Link href="/" className={`nav-link home-link ${isHomeActive ? 'active' : ''}`} aria-label="Главная">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon">
              <path d="M3.29 11.29 11.3 3.3a1 1 0 0 1 1.4 0l8.01 7.99a1 1 0 0 1-1.42 1.42L19 12.41V20a1 1 0 0 1-1 1h-4.5a1 1 0 0 1-1-1v-4h-1v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.59l-.29.3a1 1 0 0 1-1.42-1.42ZM7 10.41V19h2.5v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v4H17v-8.59l-5-4.99-5 4.99Z" />
            </svg>
            <span className="nav-label">Главная</span>
          </Link>
          <Link 
            href="/catalog" 
            className={`nav-link catalog-link ${isCatalogActive ? 'active' : ''}`}
            aria-label="Каталог"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h3A2.5 2.5 0 0 1 12 5.5v3A2.5 2.5 0 0 1 9.5 11h-3A2.5 2.5 0 0 1 4 8.5v-3ZM6.5 5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3ZM14 5.5A2.5 2.5 0 0 1 16.5 3h1A2.5 2.5 0 0 1 20 5.5v1A2.5 2.5 0 0 1 17.5 9h-1A2.5 2.5 0 0 1 14 6.5v-1ZM16.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM14 15.5a2.5 2.5 0 0 1 2.5-2.5h1a2.5 2.5 0 0 1 2.5 2.5v1a2.5 2.5 0 0 1-2.5 2.5h-1a2.5 2.5 0 0 1-2.5-2.5v-1Zm2.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM4 15.5A2.5 2.5 0 0 1 6.5 13h3a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 9.5 21h-3A2.5 2.5 0 0 1 4 18.5v-3Zm2.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3Z" />
            </svg>
            <span className="nav-label">Каталог</span>
          </Link>
          <Link href="/universities" className={`nav-link desktop-link ${isUniversitiesActive ? 'active' : ''}`}>
            Университеты
          </Link>
          <Link href="/it-merch" className={`nav-link desktop-link ${pathname?.startsWith('/it-merch') ? 'active' : ''}`}>
            IT-мерч
          </Link>
          <Link href="/" className="nav-link desktop-link">
            Новинки
          </Link>
          <Link href="/" className="nav-link desktop-link">
            О нас
          </Link>
        </nav>
        <ProductSearch />
        <nav className="user-navigation" aria-label="Пользовательское меню">
          {session ? (
            <Link 
              href="/profile"
              className={`user-nav-link profile-link ${pathname?.startsWith('/profile') ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm0 9c-4.14 0-7.5 2.58-7.5 5.75 0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25C19.5 16.58 16.14 14 12 14Zm-5.38 5c.52-1.69 2.74-3 5.38-3s4.86 1.31 5.38 3H6.62Z" />
              </svg>
              <span>{session.user?.name || "Профиль"}</span>
            </Link>
          ) : (
            <>
              <button 
                className={`user-nav-link profile-link ${isProfileActive ? 'active' : ''}`}
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
          <Link href="/favorites" className={`user-nav-link favorite-link ${isFavoritesActive ? 'active' : ''}`}>
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
          <Link href="/cart" className={`user-nav-link cart-link ${isCartActive ? 'active' : ''}`}>
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
