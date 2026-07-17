"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import "./page.scss";

interface ProfileData {
  role?: "STUDENT" | "EXPLORER" | "UNIVERSITY_ADMIN" | "SUPERADMIN" | string;
}

const useSteps = [
  {
    title: "Выберите товары и перейдите к оформлению",
    description: "Добавьте товары в корзину и нажмите «Перейти к оплате».",
    icon: "cart",
  },
  {
    title: "Примените бонусы",
    description: "На странице оплаты выберите количество бонусов для списания.",
    icon: "wallet",
  },
  {
    title: "Сэкономьте",
    description: "Бонусы будут списаны, а сумма заказа уменьшится.",
    icon: "check",
  },
];

const benefits = [
  {
    status: "Активно",
    title: "Скидка студента",
    value: "10%",
    description: "На все товары при подтвержденном статусе студента",
    action: "Как это работает",
    href: "/profile/bonuses/rules",
    icon: "graduation",
    tone: "green",
  },
  {
    status: "Активно",
    title: "Бонусы за покупки",
    value: "до 50%",
    description: "Оплачивайте бонусами до 50% от суммы заказа",
    action: "Подробнее",
    href: "/profile/bonuses/rules",
    icon: "gift",
    tone: "purple",
  },
  {
    status: "Активно",
    title: "Акционные предложения",
    value: "до 30%",
    description: "Дополнительные скидки на избранные товары",
    action: "Смотреть все акции",
    href: "/catalog",
    icon: "tag",
    tone: "blue",
  },
  {
    status: "Скоро",
    title: "Бонусы за отзывы",
    value: "+50 ₽",
    description: "Получайте бонусы за каждый оставленный отзыв о товаре",
    action: "Оставить отзыв",
    href: "/catalog",
    icon: "star",
    tone: "yellow",
  },
];

const faqItems = [
  {
    question: "Как начисляются бонусы?",
    answer: "Бонусы начисляются автоматически при совершении покупок в нашем магазине. За каждый заказ вам возвращается от 1% до 10% в виде бонусов (1 бонус = 1 рубль), в зависимости от вашего уровня в программе лояльности.",
  },
  {
    question: "Как и когда я могу использовать бонусы?",
    answer: "Бонусы можно списать на этапе оформления заказа. Вы можете оплатить ими до 50% от общей стоимости товаров в корзине. Обратите внимание, что бонусы не применяются к стоимости доставки.",
  },
  {
    question: "Сколько действуют бонусы?",
    answer: "Начисленные бонусы действительны в течение 180 дней с момента их получения. За 7 дней до их сгорания мы обязательно напомним вам об этом уведомлением.",
  },
  {
    question: "Можно ли списать бонусы вместе с промокодом?",
    answer: "Да, вы можете использовать и бонусы, и промокод в одном заказе. Сначала от суммы заказа отнимается скидка по промокоду, а затем к оставшейся сумме применяется списание бонусов.",
  },
];

const formatPrice = (value: number) => `${value.toLocaleString("ru-RU")} ₽`;

function BonusIcon({ name }: { name: string }) {
  if (name === "cart") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6h15l-2 8H8L6 6Z" />
        <path d="M6 6 5 3H2" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </svg>
    );
  }

  if (name === "wallet") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16v12H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13" />
        <path d="M16 13h5" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </svg>
    );
  }

  if (name === "graduation") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 10 5-10 5L2 8l10-5Z" />
        <path d="M6 10v5c2 2 10 2 12 0v-5" />
      </svg>
    );
  }

  if (name === "gift") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11h16v10H4V11Z" />
        <path d="M2 7h20v4H2V7Z" />
        <path d="M12 7v14" />
        <path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5L12 7Z" />
        <path d="M12 7h3.5A2.5 2.5 0 1 0 13 4.5L12 7Z" />
      </svg>
    );
  }

  if (name === "tag") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 12 12 20 4 12V4h8l8 8Z" />
        <path d="M8 8h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </svg>
  );
}

function DoubleBonusVisual() {
  return (
    <div className="double-bonus-visual" aria-hidden="true">
      <img src="/2x-bonus.png" alt="2x Bonus" />
    </div>
  );
}

function HoodieVisual() {
  return (
    <div className="hoodie-visual" aria-hidden="true">
      <img src="/hoodie-bonuses.png" alt="Hoodie Bonus" />
    </div>
  );
}

export default function ProfileBonusesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = (await res.json()) as ProfileData;
        setProfile(data);
      }
    }

    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const bonusBalance = 0;
  const nextLevelTarget = 2_000;
  const remainingToNextLevel = Math.max(nextLevelTarget - bonusBalance, 0);
  const progressPercent = Math.min((bonusBalance / nextLevelTarget) * 100, 100);
  const userLevel = profile?.role === "STUDENT" ? "Студент" : "Базовый";
  const userDiscount = profile?.role === "STUDENT" ? "10%" : "0%";

  return (
    <div className="profile-bonuses-page">
      <section className="bonus-overview-card">
        <div className="bonus-balance-block">
          <span>Ваш бонусный баланс</span>
          <strong>{formatPrice(bonusBalance)}</strong>
          <p>1 бонус = 1 ₽</p>
          <Link href="/profile/bonuses/history">
            История бонусов
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 5l7 7-7 7M5 12h14" />
            </svg>
          </Link>
        </div>

        <div className="next-level-block">
          <span>До следующего уровня</span>
          <strong>{formatPrice(remainingToNextLevel)}</strong>
          <p>совершите покупки на {formatPrice(nextLevelTarget)}</p>
          <div className="level-progress" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <small>
            {formatPrice(bonusBalance)} / {formatPrice(nextLevelTarget)}
          </small>
        </div>

        <div className="level-block">
          <span>Ваш уровень</span>
          <strong>{userLevel}</strong>
          <p>Скидка {userDiscount}</p>
          <Link href="/profile/bonuses/rules">
            Как работают уровни
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 5l7 7-7 7M5 12h14" />
            </svg>
          </Link>
        </div>

      </section>

      <section className="bonus-section">
        <h2>Как использовать бонусы</h2>
        <div className="bonus-steps-card">
          {useSteps.map((step, index) => (
            <article className="bonus-step" key={step.title}>
              <div className="bonus-step-icon">
                <BonusIcon name={step.icon} />
              </div>
              <div className="step-title-row">
                <span className="step-count">{index + 1}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bonus-section">
        <h2>Доступные скидки и преимущества</h2>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <article className={`benefit-card ${benefit.tone}`} key={benefit.title}>
              <span className="benefit-status">{benefit.status}</span>
              <div className="benefit-icon">
                <BonusIcon name={benefit.icon} />
              </div>
              <h3>{benefit.title}</h3>
              <strong>{benefit.value}</strong>
              <p>{benefit.description}</p>
              <Link href={benefit.href}>
                {benefit.action}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13 5l7 7-7 7M5 12h14" />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bonus-section">
        <h2>Специальные предложения</h2>
        <div className="specials-grid">
          <article className="special-card double-bonus-special">
            <div>
              <span>До 31 мая</span>
              <h3>Больше покупок - больше бонусов!</h3>
              <p>Получайте до 2x бонусов за покупки от 5 000 ₽</p>
              <Link href="/catalog">Подробнее</Link>
            </div>
            <DoubleBonusVisual />
          </article>
          <article className="special-card hoodie-special">
            <div>
              <span>До 15 июня</span>
              <h3>Скидка 15% на мерч университетов</h3>
              <p>Для студентов всех аккредитованных вузов</p>
              <Link href="/catalog">Подробнее</Link>
            </div>
            <HoodieVisual />
          </article>
        </div>
      </section>

      <section className="bonus-section">
        <h2>Часто задаваемые вопросы</h2>
        <div className="bonus-faq">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
