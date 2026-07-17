"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import "./page.scss";

const accrualMethods = [
  {
    title: "За покупки",
    description: "Начисляем бонусы за каждый заказ после его доставки.",
    note: "До 10% от суммы заказа",
    icon: "bag",
  },
  {
    title: "За отзывы",
    description: "Оставляйте отзывы на товары и получайте бонусы.",
    note: "+50 бонусов",
    icon: "star",
  },
  {
    title: "За акции",
    description: "Участвуйте в акциях и получайте больше бонусов.",
    note: "До 300 бонусов",
    icon: "gift",
  },
  {
    title: "За приглашения",
    description: "Приглашайте друзей и получайте бонусы.",
    note: "+100 бонусов за друга",
    icon: "user",
  },
];

const usageSteps = [
  {
    title: "Добавьте товары в корзину",
    description: "Выберите все, что хотите купить.",
  },
  {
    title: "Перейдите к оплате",
    description: "На странице оформления заказа.",
  },
  {
    title: "Выберите бонусы",
    description: "Укажите, сколько бонусов хотите списать.",
  },
  {
    title: "Оплатите заказ",
    description: "Бонусами можно оплатить до 50% от суммы заказа.",
  },
];

const importantRules = [
  {
    title: "Бонусы начисляются после доставки заказа",
    description:
      "Как только заказ будет доставлен, бонусы появятся на вашем счете.",
    icon: "clock",
  },
  {
    title: "Срок действия бонусов - 12 месяцев",
    description: "Используйте бонусы в течение года с момента начисления.",
    icon: "calendar",
  },
  {
    title: "До 50% от суммы заказа",
    description: "Вы можете оплатить бонусами до половины стоимости заказа.",
    icon: "wallet",
  },
  {
    title: "Не суммируются с промокодами и другими скидками",
    description:
      "Бонусы не действуют вместе с промокодами и спецпредложениями.",
    icon: "tag",
  },
  {
    title: "При возврате товара бонусы списываются",
    description: "Если вы вернули товар, бонусы за него будут списаны.",
    icon: "refresh",
  },
];

function RuleIcon({ name }: { name: string }) {
  if (name === "bag") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 7h12l1 14H5L6 7Z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </svg>
    );
  }

  if (name === "star") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
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

  if (name === "user") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
        <path d="M3 21a8 8 0 0 1 16 0" />
        <path d="M19 8v6" />
        <path d="M16 11h6" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2v3M17 2v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
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
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 16" />
      <path d="M4 20v-4h4" />
    </svg>
  );
}

function GiftIllustration() {
  return (
    <div className="rules-gift" aria-hidden="true">
      <svg viewBox="0 0 160 120">
        <path className="gift-box" d="M32 54h88v54H32z" />
        <path className="gift-lid" d="M24 38h104v22H24z" />
        <path className="gift-ribbon" d="M72 38h16v70H72z" />
        <path className="gift-ribbon" d="M24 54h104v9H24z" />
        <path
          className="gift-bow"
          d="M73 38H52c-10 0-16-10-9-17 14-12 28 1 30 17Z"
        />
        <path
          className="gift-bow"
          d="M87 38h21c10 0 16-10 9-17-14-12-28 1-30 17Z"
        />
        <circle className="gift-coin" cx="118" cy="82" r="24" />
        <path
          className="gift-star"
          d="m118 67 4.2 8.4 9.3 1.3-6.7 6.5 1.6 9.2-8.4-4.4-8.4 4.4 1.6-9.2-6.7-6.5 9.3-1.3L118 67Z"
        />
      </svg>
    </div>
  );
}

export default function BonusRulesPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  return (
    <div className="bonus-rules-page">
      {/* <section className="rules-heading">
        <span className="section-kicker">Как это работает</span>
        <h2>Разбираем все о бонусах Campus & Code</h2>
      </section> */}

      <section className="rules-hero-card">
        <div>
          <h3>Бонусы — это наша благодарность вам</h3>
          <p>Покупайте, участвуйте в акциях и получайте бонусы.</p>
          <p>1 бонус = 1 ₽.</p>
          <p>Оплачивайте до 50% от суммы заказа бонусами.</p>
        </div>
        <Image
          src="/bonuses.png"
          alt="Бонусы"
          width={200}
          height={200}
          className="rules-gift"
          style={{ objectFit: "contain" }}
        />
      </section>

      <section className="rules-section">
        <h3>1. Как начисляются бонусы</h3>
        <div className="accrual-grid">
          {accrualMethods.map((method) => (
            <article className="accrual-card" key={method.title}>
              <div className="accrual-icon">
                <RuleIcon name={method.icon} />
              </div>
              <h4>{method.title}</h4>
              <p>{method.description}</p>
              <span>{method.note}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="rules-section">
        <h3>2. Как использовать бонусы</h3>
        <div className="usage-steps">
          {usageSteps.map((step, index) => (
            <article className="usage-step" key={step.title}>
              <span className="step-number">{index + 1}</span>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rules-section">
        <h3>3. Важные правила</h3>
        <div className="important-rules">
          {importantRules.map((rule) => (
            <article className="important-rule" key={rule.title}>
              <div className="important-icon">
                <RuleIcon name={rule.icon} />
              </div>
              <div>
                <h4>{rule.title}</h4>
                <p>{rule.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rules-cta">
        <div className="cta-icon">%</div>
        <div>
          <h3>Больше покупок - больше бонусов</h3>
          <p>Покупайте чаще, следите за акциями и получайте максимум выгоды.</p>
        </div>
        <Link href="/catalog">Перейти к покупкам</Link>
      </section>
    </div>
  );
}
