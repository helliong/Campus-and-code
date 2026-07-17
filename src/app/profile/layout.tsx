import { Metadata } from "next";
import ProfilePageHeader from "@/components/ProfilePageHeader";
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
      <ProfilePageHeader />

      <div className="profile-grid">
        <ProfileSidebar />
        <section className="profile-content">
          {children}
        </section>
      </div>
    </main>
  );
}
