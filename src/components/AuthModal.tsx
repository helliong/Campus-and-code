import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiX, FiMail, FiSmartphone, FiUser } from 'react-icons/fi';
import { SiVk, SiGithub } from 'react-icons/si';
import './AuthModal.scss';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Закрыть">
          <FiX />
        </button>

        <div className="modal-header">
          <div className="icon-container">
            <div className="icon-wrapper">
              <FiUser className="user-icon" />
            </div>
            <div className="sparkle">✦</div>
          </div>
          <h2>Войдите в аккаунт</h2>
          <p>Чтобы сохранять избранное, отслеживать заказы и получать бонусы.</p>
        </div>

        <div className="modal-body">
          <Link href="/login" className="btn btn-email" onClick={onClose}>
            <FiMail className="btn-icon" /> Войти по email
          </Link>
          <button disabled className="btn btn-phone">
            <FiSmartphone className="btn-icon" /> Войти по телефону
          </button>

          <div className="divider">
            <span>или</span>
          </div>

          <div className="social-login">
            <button disabled className="btn-social" aria-label="Войти через VK">
              <SiVk />
            </button>
            <button disabled className="btn-social" aria-label="Войти через GitHub">
              <SiGithub />
            </button>
          </div>

          <div className="modal-footer">
            Нет аккаунта? <Link href="/register" onClick={onClose}>Зарегистрироваться</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
