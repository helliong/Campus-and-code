import { Metadata } from "next";
import Link from "next/link";
import ProfileSidebar from "@/components/ProfileSidebar";
import "./layout.scss";

export const metadata: Metadata = {
  title: "Профиль | Campus & Code",
  description: "Управление вашим профилем, заказами и настройками.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="profile-layout-container">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span className="separator">&gt;</span>
        <span className="current">Профиль</span>
      </nav>

      <div className="profile-header">
        <h1>Профиль</h1>
        <p className="subtitle">Управляйте своими данными, заказами и настройками</p>
      </div>

      <div className="profile-grid">
        <ProfileSidebar />
        <section className="profile-content">
          {children}
        </section>
      </div>
    </main>
  );
}
