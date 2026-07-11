'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../login/page.scss';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.message || 'Ошибка регистрации');
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>Регистрация</h1>
        <p className="subtitle">Создайте аккаунт, чтобы получить доступ к бонусам.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
          <div className="form-group">
            <label htmlFor="name">Ваше Имя</label>
            <input type="text" id="name" placeholder="Иван Иванов" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Университетский Email</label>
            <input type="email" id="email" placeholder="example@urfu.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>

          <div className="form-checkbox">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">Я принимаю <Link href="#">условия использования</Link></label>
          </div>

          <button type="submit" className="submit-btn">
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
