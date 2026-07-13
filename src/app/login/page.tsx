"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiChevronRight,
} from "react-icons/fi";
import { SiVk, SiGithub } from "react-icons/si";
import { PiTicket } from "react-icons/pi";
import "./page.scss";

const LOGIN_LOCKOUT_STORAGE_KEY = "login-lockout-until";
const IS_RATE_LIMIT_CLEAR_ENABLED = process.env.NODE_ENV !== "production";

function getLoginErrorMessage(error?: string | null) {
  if (!error) return "";

  const decodedError = decodeURIComponent(error);

  if (decodedError.includes("Слишком много") || decodedError.includes("Подождите")) {
    return decodedError;
  }

  return "Неверный email или пароль";
}

function getLockoutErrorMessage(lockoutSeconds: number) {
  return `Слишком много неудачных попыток входа. Подождите ${formatLockoutTime(lockoutSeconds)}`;
}

function getRetryAfterSeconds(message: string) {
  const minutesMatch = message.match(/(\d+)\s*мин/);
  const secondsMatch = message.match(/(\d+)\s*сек/);
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  const seconds = secondsMatch ? Number(secondsMatch[1]) : 0;

  return minutes * 60 + seconds;
}

function formatLockoutTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds} сек.`;
  }

  if (seconds === 0) {
    return `${minutes} мин.`;
  }

  return `${minutes} мин. ${seconds} сек.`;
}

function getLockoutSecondsFromStorage() {
  if (typeof window === "undefined") return 0;

  const storedLockoutUntil = window.sessionStorage.getItem(LOGIN_LOCKOUT_STORAGE_KEY);
  if (!storedLockoutUntil) return 0;

  const lockoutUntil = Number(storedLockoutUntil);
  if (!Number.isFinite(lockoutUntil)) return 0;

  return Math.max(Math.ceil((lockoutUntil - Date.now()) / 1000), 0);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const isLoginBlocked = lockoutSeconds > 0;
  const displayedError = isLoginBlocked ? getLockoutErrorMessage(lockoutSeconds) : error;

  useEffect(() => {
    const storedLockoutSeconds = getLockoutSecondsFromStorage();
    if (storedLockoutSeconds <= 0) {
      window.sessionStorage.removeItem(LOGIN_LOCKOUT_STORAGE_KEY);
      return;
    }

    const timerId = window.setTimeout(() => {
      setLockoutSeconds(storedLockoutSeconds);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (lockoutSeconds <= 0) {
      window.sessionStorage.removeItem(LOGIN_LOCKOUT_STORAGE_KEY);
      return;
    }

    const timerId = window.setInterval(() => {
      setLockoutSeconds((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginBlocked) return;

    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      const loginError = getLoginErrorMessage(res.error);
      const retryAfterSeconds = getRetryAfterSeconds(loginError);

      if (retryAfterSeconds > 0) {
        window.sessionStorage.setItem(LOGIN_LOCKOUT_STORAGE_KEY, String(Date.now() + retryAfterSeconds * 1000));
        setLockoutSeconds(retryAfterSeconds);
        setError("");
      } else {
        setError(loginError);
      }
    } else {
      window.sessionStorage.removeItem(LOGIN_LOCKOUT_STORAGE_KEY);
      setLockoutSeconds(0);
      router.push("/");
      router.refresh();
    }
  };

  const handleClearLoginError = async () => {
    await fetch("/api/auth/rate-limit/clear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    window.sessionStorage.removeItem(LOGIN_LOCKOUT_STORAGE_KEY);
    setLockoutSeconds(0);
    setError("");
  };

  return (
    <main className="login-page">
      <div className="login-breadcrumbs">
        <Link href="/">Главная</Link>
        <FiChevronRight className="separator" />
        <span>Вход</span>
      </div>

      <div className="login-header">
        <h1>Вход</h1>
        <p>
          Добро пожаловать в Campus <span className="ampersand">&amp;</span>{" "}
          Code
        </p>
      </div>

      <div className="login-card">
        <div className="login-card-left">
          <div className="brand-header">
            <svg
              className="icon-logo"
              viewBox="0 0 69 69"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M34.5 66.5C52.1731 66.5 66.5 52.1731 66.5 34.5C66.5 16.8269 52.1731 2.5 34.5 2.5C16.8269 2.5 2.5 16.8269 2.5 34.5C2.5 52.1731 16.8269 66.5 34.5 66.5Z"
                stroke="currentColor"
                strokeWidth="5"
              />
              <path
                d="M46 18.5C42 15.9 37.7 15 33.5 15C23.1 15 15.5 22.8 15.5 34.5C15.5 46.2 23.1 54 33.5 54C38.3 54 42.7 52.6 46.5 49.5"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M33.5 26.5L25.5 34.5L33.5 42.5"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M40.5 26.5L48.5 34.5L40.5 42.5"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2>
              Campus <span className="ampersand">&amp;</span> Code
            </h2>
          </div>
          <p className="brand-desc">
            Магазин IT и университетской атрибутики
            <br />
            для тех, кто учится, кодит и создаёт будущее.
          </p>
          <div className="merch-image-wrapper">
            <img src="/auth-mockup-transparent.webp?v=9" alt="Campus & Code Merch" />
          </div>
        </div>

        <div className="login-card-right">
          <h3>Войдите в аккаунт</h3>

          <form className="login-form" onSubmit={handleSubmit}>
            {displayedError && (
              <div className="error-message">
                <span>{displayedError}</span>
                {isLoginBlocked && IS_RATE_LIMIT_CLEAR_ENABLED && (
                  <button type="button" onClick={handleClearLoginError}>
                    Очистить
                  </button>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Введите ваш email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              <div className="forgot-password">
                <Link href="#">Забыли пароль?</Link>
              </div>
            </div>

            <div className="form-checkbox">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Запомнить меня</label>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoginBlocked}>
              Войти
            </button>
          </form>

          <div className="divider">
            <span>или</span>
          </div>

          <div className="social-buttons">
            <button className="social-btn" disabled>
              <SiVk className="social-icon vk" />
              <span>Войти через VK</span>
            </button>
            <button className="social-btn" disabled>
              <SiGithub className="social-icon github" />
              <span>Войти через GitHub</span>
            </button>
          </div>

          <p className="register-link">
            Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
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
