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
  const [fieldErrors, setFieldErrors] = useState<{name?: string, email?: string, password?: string, confirmPassword?: string}>({});

  const validate = () => {
    const errors: any = {};
    if (!name.trim()) errors.name = 'Имя обязательно';
    if (!email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Некорректный формат email';
    }
    if (password.length < 6) errors.password = 'Пароль должен содержать минимум 6 символов';
    if (password !== confirmPassword) errors.confirmPassword = 'Пароли не совпадают';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

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

  const clearError = (field: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>Регистрация</h1>
        <p className="subtitle">Создайте аккаунт, чтобы получить доступ к бонусам.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && <p className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '4px' }}>{error}</p>}
          
          <div className="form-group">
            <label htmlFor="name">Ваше Имя</label>
            <input type="text" id="name" placeholder="Иван Иванов" value={name} onChange={e => {setName(e.target.value); clearError('name');}} required className={fieldErrors.name ? 'input-error' : ''} />
            {fieldErrors.name && <span className="error-text">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Университетский Email</label>
            <input type="email" id="email" placeholder="example@urfu.com" value={email} onChange={e => {setEmail(e.target.value); clearError('email');}} required className={fieldErrors.email ? 'input-error' : ''} />
            {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" value={password} onChange={e => {setPassword(e.target.value); clearError('password');}} required className={fieldErrors.password ? 'input-error' : ''} />
            {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => {setConfirmPassword(e.target.value); clearError('confirmPassword');}} required className={fieldErrors.confirmPassword ? 'input-error' : ''} />
            {fieldErrors.confirmPassword && <span className="error-text">{fieldErrors.confirmPassword}</span>}
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
