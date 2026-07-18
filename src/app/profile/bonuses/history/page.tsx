"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import "./page.scss";

interface ProfileData {
  name?: string | null;
  email?: string | null;
  role?: "STUDENT" | "EXPLORER" | "UNIVERSITY_ADMIN" | "SUPERADMIN" | string;
}

interface BonusOperation {
  id: string;
  createdAt: string;
  description: string;
  details: string;
  type: "accrual" | "spending" | "expiration";
  amount: number;
  balanceAfter: number;
}

const bonusOperations: BonusOperation[] = [];

const operationTabs = [
  { label: "Все операции", type: "all" },
  { label: "Начисления", type: "accrual" },
  { label: "Списания", type: "spending" },
  { label: "Сгорание бонусов", type: "expiration" },
];

const formatBonusAmount = (amount: number) =>
  `${amount.toLocaleString("ru-RU")} ₽`;

const getRoleLabel = (role?: ProfileData["role"]) => {
  switch (role) {
    case "STUDENT":
      return "Студент";
    case "UNIVERSITY_ADMIN":
      return "Администратор";
    case "SUPERADMIN":
      return "Суперадмин";
    case "EXPLORER":
      return "Исследователь";
    default:
      return "Пользователь";
  }
};

export default function BonusHistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = (await res.json()) as ProfileData;
          setProfile(data);
        }
      } finally {
        setIsProfileLoaded(true);
      }
    }

    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const bonusBalance = 0;
  const totalAccrued = 0;
  const totalSpent = 0;
  const displayName = isProfileLoaded
    ? profile?.name || profile?.email?.split("@")[0] || "Пользователь"
    : "Загрузка...";
  const displayEmail = isProfileLoaded ? profile?.email : "";
  const displayRole = getRoleLabel(profile?.role);
  const discount = profile?.role === "STUDENT" ? "10%" : "0%";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bonus-history-page">
      <section className="bonus-account-card">
        <div className="account-user">
          <div className="account-avatar">{initials || "CC"}</div>
          <div>
            <strong>{displayName}</strong>
            {displayEmail && <span>{displayEmail}</span>}
            <div className="account-badges">
              <span>Статус: {displayRole}</span>
              <span>{discount}</span>
            </div>
          </div>
        </div>

        <div className="bonus-balance">
          <span>Ваш баланс</span>
          <strong>{formatBonusAmount(bonusBalance)}</strong>
          <p>1 бонус = 1 ₽</p>
        </div>

        <div className="bonus-totals" aria-label="Итоги бонусов">
          <div>
            <span>Начислено</span>
            <strong className="positive">{formatBonusAmount(totalAccrued)}</strong>
          </div>
          <div>
            <span>Потрачено</span>
            <strong className="negative">{formatBonusAmount(totalSpent)}</strong>
          </div>
        </div>

        <Link href="/profile/bonuses/rules" className="bonus-rules-link">
          Подробнее о бонусах
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 5l7 7-7 7M5 12h14" />
          </svg>
        </Link>
      </section>

      <section className="bonus-history-panel">
        <div className="bonus-toolbar">
          <div className="bonus-tabs" role="tablist" aria-label="Фильтр операций">
            {operationTabs.map((tab, index) => (
              <button
                className={`bonus-tab ${index === 0 ? "active" : ""}`}
                key={tab.type}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="period-button" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
            </svg>
            За все время
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="bonus-table-wrap">
          <table className="bonus-table">
            <thead>
              <tr>
                <th>Дата и время</th>
                <th>Описание</th>
                <th>Тип операции</th>
                <th>Сумма</th>
                <th>Баланс после</th>
              </tr>
            </thead>
            <tbody>
              {bonusOperations.map((operation) => (
                <tr key={operation.id}>
                  <td data-label="Дата и время">{operation.createdAt}</td>
                  <td data-label="Описание">
                    <strong>{operation.description}</strong>
                    <span>{operation.details}</span>
                  </td>
                  <td data-label="Тип операции">{operation.type}</td>
                  <td data-label="Сумма">{formatBonusAmount(operation.amount)}</td>
                  <td data-label="Баланс после">{formatBonusAmount(operation.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {bonusOperations.length === 0 && (
            <div className="bonus-empty-state">
              <div className="empty-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h3>История бонусов пока пустая</h3>
                <p>
                  Когда появятся реальные начисления, списания или сгорания
                  бонусов, они будут показаны в этой таблице.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bonus-info-card">
        <div className="info-icon">i</div>
        <div>
          <h3>Важно знать</h3>
          <ul>
            <li>Бонусы начисляются за покупки, отзывы и участие в акциях.</li>
            <li>1 бонус = 1 ₽. Бонусами можно оплатить часть суммы заказа.</li>
            <li>Бонусы сгорают через 12 месяцев после начисления.</li>
            <li>Бонусы не суммируются с промокодами и другими скидками.</li>
          </ul>
        </div>
        <div className="bonus-gift" aria-hidden="true">
          <svg viewBox="0 0 120 100">
            <path d="M20 44h80v46H20z" />
            <path d="M14 30h92v18H14z" />
            <path d="M54 30h12v60H54z" />
            <path d="M32 15c13-9 24 2 28 15H42c-10 0-16-9-10-15Z" />
            <path d="M88 15c-13-9-24 2-28 15h18c10 0 16-9 10-15Z" />
          </svg>
        </div>
      </section>
    </div>
  );
}
