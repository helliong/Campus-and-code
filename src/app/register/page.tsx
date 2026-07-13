"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiChevronRight,
  FiShoppingCart,
  FiHeart,
  FiPackage,
  FiStar,
} from "react-icons/fi";
import { SiVk, SiGithub } from "react-icons/si";
import { PiTicket } from "react-icons/pi";
import "../login/page.scss";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const errors: any = {};
    if (!name.trim()) errors.name = "Имя обязательно";
    if (!email.trim()) {
      errors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Некорректный формат email";
    }
    if (password.length < 8)
      errors.password = "Пароль должен содержать минимум 8 символов";
    if (password !== confirmPassword)
      errors.confirmPassword = "Пароли не совпадают";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!termsAccepted) {
      setError("Необходимо согласиться с условиями");
      return;
    }

    if (!validate()) return;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.message || "Ошибка регистрации");
    }
  };

  const clearError = (field: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <main className="login-page">
      <div className="login-breadcrumbs">
        <Link href="/">Главная</Link>
        <FiChevronRight className="separator" />
        <span>Регистрация</span>
      </div>

      <div className="login-header">
        <h1>Регистрация</h1>
        <p>
          Создайте аккаунт, чтобы делать покупки, сохранять избранное и получать
          бонусы
        </p>
      </div>

      <div className="login-card">
        <div className="login-card-left register-left">
          <div className="merch-image-wrapper">
            <img src="/auth-mockup-transparent.webp?v=9" alt="Campus & Code Merch" />
          </div>

          <div className="register-benefits">
            <h3>
              Добро пожаловать в Campus <span className="ampersand">&amp;</span>{" "}
              Code!
            </h3>
            <p className="benefits-subtitle">Создайте аккаунт, чтобы:</p>

            <ul className="benefits-list">
              <li>
                <FiShoppingCart className="b-icon" /> Быстро оформлять заказы
              </li>
              <li>
                <FiHeart className="b-icon" /> Сохранять товары в избранное
              </li>
              <li>
                <FiPackage className="b-icon" /> Отслеживать статус заказов
              </li>
              <li>
                <FiStar className="b-icon" /> Получать бонусы и скидки
              </li>
            </ul>

            <div className="login-link-bottom">
              Уже есть аккаунт? <Link href="/login">Войти</Link>
            </div>
          </div>
        </div>

        <div className="login-card-right">
          <h3>Создайте аккаунт</h3>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Имя</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="name"
                  placeholder="Введите ваше имя"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  className={fieldErrors.name ? "input-error" : ""}
                />
              </div>
              {fieldErrors.name && (
                <span className="error-text">{fieldErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Введите ваш email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                  className={fieldErrors.email ? "input-error" : ""}
                />
              </div>
              {fieldErrors.email && (
                <span className="error-text">{fieldErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Создайте пароль"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  className={fieldErrors.password ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Показать пароль"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <span className="password-hint">
                Минимум 8 символов: заглавные и строчные буквы, цифры и
                спецсимволы
              </span>
              {fieldErrors.password && (
                <span className="error-text">{fieldErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError("confirmPassword");
                  }}
                  className={fieldErrors.confirmPassword ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Показать пароль"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="error-text">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            <div className="form-checkbox">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms">
                Я согласен с{" "}
                <Link href="#">условиями Пользовательского соглашения</Link> и{" "}
                <Link href="#">Политикой конфиденциальности</Link>
              </label>
            </div>

            <button type="submit" className="submit-btn">
              Зарегистрироваться
            </button>
          </form>

          <div className="divider">
            <span>или</span>
          </div>

          <div className="social-buttons">
            <button className="social-btn" disabled>
              <SiVk className="social-icon vk" />
              <span>Зарегистрироваться через VK</span>
            </button>
            <button className="social-btn" disabled>
              <SiGithub className="social-icon github" />
              <span>Зарегистрироваться через GitHub</span>
            </button>
          </div>

          <p className="login-redirect-link">
            Уже есть аккаунт? <Link href="/login">Войти</Link>
          </p>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-item">
          <FiTruck className="feature-icon" />
          <div className="feature-text">
            <h4>Быстрая доставка</h4>
            <p>По России при заказе от 3 000 ₽</p>
          </div>
        </div>
        <div className="feature-item">
          <PiTicket className="feature-icon" />
          <div className="feature-text">
            <h4>Бонусы и скидки</h4>
            <p>Копите бонусы и оплачивайте ими до 30% заказа</p>
          </div>
        </div>
        <div className="feature-item">
          <FiShield className="feature-icon" />
          <div className="feature-text">
            <h4>Безопасность</h4>
            <p>Ваши данные защищены современными технологиями</p>
          </div>
        </div>
        <div className="feature-item">
          <FiHeadphones className="feature-icon" />
          <div className="feature-text">
            <h4>Поддержка 24/7</h4>
            <p>Мы всегда на связи и готовы помочь</p>
          </div>
        </div>
      </div>
    </main>
  );
}
