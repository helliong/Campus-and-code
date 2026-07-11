'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import './page.scss';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>Вход</h1>
        <p className="subtitle">Войдите, чтобы получить доступ к эксклюзивному мерчу.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
          <div className="form-group">
            <label htmlFor="email">Университетский Email</label>
            <input type="email" id="email" placeholder="example@urfu.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="submit-btn">
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
