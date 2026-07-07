'use client';

import Link from 'next/link';
import '../login/page.scss'; // We can reuse the login styles since the layout is identical

export default function RegisterPage() {
  return (
    <main className="login-page">
      <div className="login-container">
        <h1>Регистрация</h1>
        <p className="subtitle">Создайте аккаунт, чтобы получить доступ к бонусам.</p>

        <form className="login-form">
          <div className="form-group">
            <label htmlFor="name">Ваше Имя</label>
            <input type="text" id="name" placeholder="Иван Иванов" required />
          </div>


          <div className="form-group">
            <label htmlFor="email">Университетский Email</label>
            <input type="email" id="email" placeholder="example@urfu.com" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" required />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input type="password" id="confirmPassword" required />
          </div>

          <div className="form-checkbox">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">Я принимаю <Link href="#">условия использования</Link></label>
          </div>

          <button type="button" className="submit-btn" onClick={() => alert('Пока это только дизайн!')}>
            Зарегистрироваться
          </button>
        </form>

        <p className="register-link" style={{ marginTop: '1.5rem' }}>
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </p>
      </div>
    </main>
  );
}
