# Docker

Проект можно запустить через Docker Compose: приложение Next.js и PostgreSQL поднимаются вместе.

## Локальный запуск через Docker

1. Скопировать пример переменных окружения:

   ```bash
   cp docker.env.example .env
   ```

2. Проверить значения в `.env`.

   Для локального запуска можно оставить `NEXTAUTH_URL=http://localhost:3001`.
   Перед деплоем на сервер обязательно заменить `POSTGRES_PASSWORD`, `NEXTAUTH_SECRET` и `NEXTAUTH_URL`.

3. Собрать и запустить контейнеры:

   ```bash
   docker compose up -d --build
   ```

4. Открыть приложение:

   ```text
   http://localhost:3001
   ```

Миграции Prisma применяются автоматически при старте контейнера `app` через `prisma migrate deploy`.

## Полезные команды

Посмотреть логи приложения:

```bash
docker compose logs -f app
```

Посмотреть логи базы данных:

```bash
docker compose logs -f postgres
```

Остановить контейнеры:

```bash
docker compose down
```

Остановить контейнеры и удалить volumes с данными:

```bash
docker compose down -v
```

## Данные

Данные PostgreSQL сохраняются в volume `postgres_data`.

Загруженные изображения сохраняются в volume `uploads_data` и доступны приложению в `/app/public/uploads`.

## Деплой на сервер

На сервере нужно задать production-значения:

```env
POSTGRES_USER=uni_user
POSTGRES_PASSWORD=strong_password
POSTGRES_DB=uni_practice_app
NEXTAUTH_URL=https://your-domain.example
NEXTAUTH_SECRET=strong_random_secret
APP_PORT=3000
```

После этого:

```bash
docker compose up -d --build
```
