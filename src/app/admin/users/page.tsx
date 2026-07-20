import { Role, type Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { FiSearch, FiUserCheck, FiUsers, FiUserX } from "react-icons/fi";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database/prisma";
import "./page.scss";

const PAGE_SIZE = 15;
const roleLabels: Record<Role, string> = {
  STUDENT: "Студент",
  EXPLORER: "Пользователь",
  UNIVERSITY_ADMIN: "Администратор университета",
  SUPERADMIN: "Суперадминистратор",
};
const supportedRoles = new Set<Role>(Object.values(Role));
const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type UsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  name: string,
) {
  const value = params[name];
  return Array.isArray(value) ? value[0] : value;
}

function getInitials(name: string | null, email: string) {
  return (name?.trim() || email)
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getPageHref(search: string, role: Role | undefined, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/admin/users${query ? `?${query}` : ""}`;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const search = getSearchParam(params, "search")?.trim() || "";
  const requestedRole = getSearchParam(params, "role");
  const role = requestedRole && supportedRoles.has(requestedRole as Role)
    ? requestedRole as Role
    : undefined;
  const requestedPage = Number.parseInt(getSearchParam(params, "page") || "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const isUniversityAdmin = session?.user.role === Role.UNIVERSITY_ADMIN;
  const scopedUniversityId = isUniversityAdmin
    ? session.user.universityId || "__missing_university__"
    : undefined;
  const scopeWhere: Prisma.UserWhereInput = scopedUniversityId
    ? { universityId: scopedUniversityId }
    : {};
  const filters: Prisma.UserWhereInput[] = [];

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (role) filters.push({ role });

  const where: Prisma.UserWhereInput = filters.length > 0
    ? { ...scopeWhere, AND: filters }
    : scopeWhere;
  const totalCount = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const [users, allCount, studentCount, explorerCount, adminCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        university: { select: { name: true, shortName: true } },
        _count: {
          select: {
            favorites: true,
            cartItems: true,
            verificationRequests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where: scopeWhere }),
    prisma.user.count({ where: { ...scopeWhere, role: Role.STUDENT } }),
    prisma.user.count({ where: { ...scopeWhere, role: Role.EXPLORER } }),
    prisma.user.count({
      where: {
        ...scopeWhere,
        role: { in: [Role.UNIVERSITY_ADMIN, Role.SUPERADMIN] },
      },
    }),
  ]);

  const firstShownItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastShownItem = Math.min(currentPage * PAGE_SIZE, totalCount);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter((pageNumber) => Math.abs(pageNumber - currentPage) <= 2);

  return (
    <div className="admin-users-page">
      <header className="users-page-heading">
        <div>
          <h1>Пользователи</h1>
          <p>
            {isUniversityAdmin
              ? "Пользователи вашего университета и их активность."
              : "Зарегистрированные пользователи всех университетов."}
          </p>
        </div>
      </header>

      <section className="users-metrics" aria-label="Статистика пользователей">
        <article>
          <span className="metric-icon all"><FiUsers /></span>
          <span><small>Всего</small><strong>{allCount}</strong></span>
        </article>
        <article>
          <span className="metric-icon students"><FiUserCheck /></span>
          <span><small>Студенты</small><strong>{studentCount}</strong></span>
        </article>
        <article>
          <span className="metric-icon explorers"><FiUserX /></span>
          <span><small>Пользователи</small><strong>{explorerCount}</strong></span>
        </article>
        <article>
          <span className="metric-icon admins"><FiUserCheck /></span>
          <span><small>Администраторы</small><strong>{adminCount}</strong></span>
        </article>
      </section>

      <form className="users-filters" method="get">
        <label className="users-search">
          <FiSearch aria-hidden="true" />
          <span className="sr-only">Поиск пользователей</span>
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Имя, email или телефон"
          />
        </label>
        <label>
          <span className="sr-only">Роль</span>
          <select name="role" defaultValue={role || ""}>
            <option value="">Все роли</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
        <button type="submit">Применить</button>
        {(search || role) && <Link href="/admin/users">Сбросить</Link>}
      </form>

      <section className="users-table-card">
        {users.length > 0 ? (
          <div className="users-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Телефон</th>
                  <th>Роль</th>
                  <th>Университет</th>
                  <th>Активность</th>
                  <th>Регистрация</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-identity">
                        <span className="user-avatar">{getInitials(user.name, user.email)}</span>
                        <span>
                          <strong>{user.name || "Без имени"}</strong>
                          <small>{user.email}</small>
                        </span>
                      </div>
                    </td>
                    <td className="muted-cell">{user.phone || "Не указан"}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="university-cell">
                      {user.university ? (
                        <span title={user.university.name}>{user.university.shortName}</span>
                      ) : "Не указан"}
                    </td>
                    <td>
                      <div className="user-activity">
                        <span>Корзина: {user._count.cartItems}</span>
                        <span>Избранное: {user._count.favorites}</span>
                        <span>Заявки: {user._count.verificationRequests}</span>
                      </div>
                    </td>
                    <td className="muted-cell">{dateFormatter.format(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="users-empty-state">
            <FiUsers aria-hidden="true" />
            <strong>Пользователи не найдены</strong>
            <p>Измените параметры поиска или сбросьте фильтры.</p>
          </div>
        )}

        <footer className="users-pagination">
          <span>Показано {firstShownItem}–{lastShownItem} из {totalCount}</span>
          {totalPages > 1 && (
            <nav aria-label="Страницы пользователей">
              {currentPage > 1 && (
                <Link href={getPageHref(search, role, currentPage - 1)} aria-label="Предыдущая страница">‹</Link>
              )}
              {pageNumbers.map((pageNumber) => (
                <Link
                  href={getPageHref(search, role, pageNumber)}
                  className={pageNumber === currentPage ? "active" : ""}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                  key={pageNumber}
                >
                  {pageNumber}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link href={getPageHref(search, role, currentPage + 1)} aria-label="Следующая страница">›</Link>
              )}
            </nav>
          )}
        </footer>
      </section>
    </div>
  );
}
