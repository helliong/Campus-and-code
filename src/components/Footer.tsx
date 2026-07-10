"use client";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import { FaVk, FaTelegramPlane, FaInstagram, FaYoutube } from "react-icons/fa";
import { FiPhone, FiMail, FiClock } from "react-icons/fi";
import "./Footer.scss";

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        <div className="footer-top">
          {/* Колонка 1: Бренд */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <Link href="/">
                <img src="/campus-code-logo.svg" alt="Campus & Code" height="60" />
              </Link>
            </div>
            <p className="brand-desc">
              Магазин IT и университетской атрибутики для тех, кто учится, кодит и создает будущее.
            </p>
            <div className="social-links">
              <a href="#" aria-label="VK"><FaVk /></a>
              <a href="#" aria-label="Telegram"><FaTelegramPlane /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>

          {/* Колонка 2: Покупателям */}
          <div className="footer-col">
            <h4>Покупателям</h4>
            <nav className="footer-nav">
              <Link href="/">Каталог</Link>
              <Link href="/">Доставка и оплата</Link>
              <Link href="/">Возврат и обмен</Link>
              <Link href="/">FAQ</Link>
              <Link href="/">Таблица размеров</Link>
            </nav>
          </div>

          {/* Колонка 3: О нас */}
          <div className="footer-col">
            <h4>О нас</h4>
            <nav className="footer-nav">
              <Link href="/">О магазине</Link>
              <Link href="/">Контакты</Link>
              <Link href="/">Сотрудничество</Link>
              <Link href="/">Блог</Link>
              <Link href="/">Публичная оферта</Link>
            </nav>
          </div>

          {/* Колонка 4: Помощь */}
          <div className="footer-col">
            <h4>Помощь</h4>
            <nav className="footer-nav">
              <Link href="/">Поддержка</Link>
              <Link href="/">Статус заказа</Link>
              <Link href="/">Уход за изделиями</Link>
              <Link href="/">Подарочные карты</Link>
            </nav>
          </div>

          {/* Колонка 5: Контакты */}
          <div className="footer-col contact-col">
            <h4>Контакты</h4>
            <div className="contact-item">
              <FiPhone />
              <a href="tel:88001234567">8 (800) 123-45-67</a>
            </div>
            <div className="contact-item">
              <FiMail />
              <a href="mailto:hello@campuscode.ru">hello@campuscode.ru</a>
            </div>
            <div className="contact-item">
              <FiClock />
              <span>Ежедневно с 10:00 до 20:00</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            &copy; Campus & Code, {new Date().getFullYear()}
          </div>

          <div className="theme-toggle-wrapper">
            <span>Светлая</span>
            <label className="theme-switch">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
              <span className="slider round"></span>
            </label>
            <span>Тёмная</span>
          </div>

          <div className="policy-links">
            <Link href="/">Политика конфиденциальности</Link>
            <Link href="/">Пользовательское соглашение</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
