import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import "./admin.scss";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "UNIVERSITY_ADMIN" && session.user.role !== "SUPERADMIN")) {
    redirect("/");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          Панель Администратора
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-link">
            Главная
          </Link>
          <Link href="/admin/products" className="admin-nav-link">
            Товары
          </Link>
          <Link href="/" className="admin-nav-link">
            Вернуться в магазин
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
