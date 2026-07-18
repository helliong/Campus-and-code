"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pageMeta: Record<string, { breadcrumb: string; title: string; subtitle: string }> = {
  "/profile": {
    breadcrumb: "Профиль",
    title: "Профиль",
    subtitle: "Управляйте своими данными, заказами и настройками",
  },
  "/profile/orders": {
    breadcrumb: "Мои заказы",
    title: "Мои заказы",
    subtitle: "Следите за статусами заказов и историей покупок",
  },
  "/profile/support": {
    breadcrumb: "Поддержка",
    title: "Поддержка",
    subtitle: "Мы всегда на связи и готовы помочь с любыми вопросами",
  },
  "/profile/bonuses/history": {
    breadcrumb: "История бонусов",
    title: "История бонусов",
    subtitle: "Здесь вы можете посмотреть начисления и списания бонусов",
  },
  "/profile/bonuses": {
    breadcrumb: "Бонусы и скидки",
    title: "Бонусы и скидки",
    subtitle: "Используйте бонусы и получайте выгоду от наших предложений",
  },
  "/profile/bonuses/rules": {
    breadcrumb: "Как это работает",
    title: "Как это работает",
    subtitle: "Разбираем все о бонусах Campus & Code",
  },
};

const getPageMeta = (pathname: string | null) => {
  if (!pathname) return pageMeta["/profile"];
  return pageMeta[pathname] || pageMeta["/profile"];
};

export default function ProfilePageHeader() {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const isProfileRoot = pathname === "/profile";
  const isSubBonusPage = pathname === "/profile/bonuses/rules" || pathname === "/profile/bonuses/history";

  return (
    <>
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span className="separator">&gt;</span>
        {isProfileRoot ? (
          <span className="current">Профиль</span>
        ) : (
          <>
            <Link href="/profile">Профиль</Link>
            {isSubBonusPage && (
              <>
                <span className="separator">&gt;</span>
                <Link href="/profile/bonuses">Бонусы и скидки</Link>
              </>
            )}
            <span className="separator">&gt;</span>
            <span className="current">{meta.breadcrumb}</span>
          </>
        )}
      </nav>

      <div className="profile-header">
        <h1>{meta.title}</h1>
        <p className="subtitle">{meta.subtitle}</p>
      </div>
    </>
  );
}
