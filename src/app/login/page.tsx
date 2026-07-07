'use client';

import Link from 'next/link';
import './page.scss';

export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-container">
        <h1>Вход</h1>
        <p className="subtitle">Войдите, чтобы получить доступ к эксклюзивному мерчу.</p>

        <form className="login-form">
          <div className="form-group">
            <label htmlFor="email">Университетский Email</label>
            <input type="email" id="email" placeholder="example@urfu.com" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" required />
          </div>

          <button type="button" className="submit-btn" onClick={() => alert('Пока это только дизайн!')}>
            Войти
          </button>
        </form>

        <p className="register-link">
          Нет аккаунта? <Link href="/register">Зарегистрируйтесь</Link>
        </p>
      </div>
    </main>
  );
}
