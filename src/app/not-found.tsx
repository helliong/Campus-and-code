import React from 'react';
import Link from 'next/link';
import { FiChevronRight, FiStar } from 'react-icons/fi';
import { LuGraduationCap } from 'react-icons/lu';
import { PiHoodie, PiCode } from 'react-icons/pi';
import './not-found.scss';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Главная</Link>
          <FiChevronRight className="separator" />
          <span className="current">404</span>
        </div>

        <div className="hero-404">
          <div className="glow-bg"></div>
          <h1 className="title-404">404</h1>
          <h2 className="subtitle">Страница не найдена</h2>
          <p className="description">
            Кажется, вы заблудились. Возможно, страница была удалена,
            <br /> переименована или её никогда не существовало.
          </p>
          <Link href="/" className="btn-primary">
            Вернуться на главную
          </Link>
        </div>

        <div className="popular-sections">
          <h3>Популярные разделы</h3>
          <div className="sections-grid">
            <Link href="/catalog" className="section-card">
              <div className="icon-wrapper">
                <PiHoodie />
              </div>
              <h4>Каталог</h4>
              <p>Посмотрите наш мерч<br/>и новинки</p>
            </Link>
            <Link href="/universities" className="section-card">
              <div className="icon-wrapper">
                <LuGraduationCap />
              </div>
              <h4>Университеты</h4>
              <p>Мерч для вашего<br/>вуза</p>
            </Link>
            <Link href="/it-merch" className="section-card">
              <div className="icon-wrapper">
                <PiCode />
              </div>
              <h4>IT-мерч</h4>
              <p>Для разработчиков<br/>и айтишников</p>
            </Link>
            <Link href="/catalog?sort=new" className="section-card">
              <div className="icon-wrapper">
                <FiStar />
              </div>
              <h4>Новинки</h4>
              <p>Самые свежие<br/>поступления</p>
            </Link>
          </div>
        </div>

        <div className="bottom-banner-404">
          <div className="banner-content">
            <div className="image-wrapper">
              {/* Fallback image that looks like a dark merch mockup */}
              <img src="https://placehold.co/500x300/0a0f18/ffffff?text=Merch+Items" alt="Merch items" />
            </div>
            <div className="text-content">
              <h2>Создано для тех,<br/>кто меняет будущее</h2>
              <p>Качественный мерч для студентов,<br/>разработчиков и исследователей.</p>
              <Link href="/catalog" className="btn-outline">
                Перейти в каталог
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
