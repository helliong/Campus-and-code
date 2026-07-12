# Uni Practice App: IT / University Merch Store

Учебный проект интернет-магазина мерча (IT и университетской атрибутики).

## 🚀 Технологии

- **Фреймворк:** [Next.js](https://nextjs.org/) (App Router, версия 16)
- **Библиотека:** [React](https://react.dev/) (версия 19)
- **База данных:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Авторизация:** [NextAuth.js](https://next-auth.js.org/) (с хешированием паролей через `bcryptjs`)
- **Стилизация:** [SASS / SCSS](https://sass-lang.com/) (модули и глобальные стили)
- **Иконки:** [React Icons](https://react-icons.github.io/react-icons/)
- **Язык:** [TypeScript](https://www.typescriptlang.org/)

## 🌟 Основной функционал

- **Каталог товаров** с детальными страницами продуктов (выбор размера и цвета).
- **Корзина** с возможностью добавления/удаления товаров и оформлением заказа.
- **Избранное (Favorites)** для сохранения понравившихся товаров.
- **Аутентификация** (регистрация и логин пользователей).
- **Приватный контент** (эксклюзивный мерч, доступный для покупки только авторизованным пользователям).

## 🛠️ Установка и запуск (Локально)

1. Клонируйте репозиторий:

   ```bash
   git clone <URL_репозитория>
   cd uni-practice-app
   ```

2. Установите зависимости:

   ```bash
   npm install
   ```

3. Настройте переменные окружения:
   Создайте файл `.env` в корне проекта и добавьте строку подключения к вашей БД PostgreSQL и секреты:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/uni_practice_app?schema=public"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Примените миграции базы данных и сгенерируйте Prisma Client:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Запустите сервер для разработки:

   ```bash
   npm run dev
   ```

6. Откройте [http://localhost:3000](http://localhost:3000) в вашем браузере.

## 🗄️ Структура проекта

- `src/app/` — основные страницы приложения (App Router).
- `src/components/` — переиспользуемые UI-компоненты.
- `src/context/` — React Context провайдеры (`CartContext`, `FavoritesContext`, `ThemeContext`).
- `src/lib/` — утилиты и инициализация Prisma клиента.
- `prisma/` — схема базы данных (`schema.prisma`) и миграции.
