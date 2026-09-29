# teacher-ranking

Рейтинг преподавателей: Django REST + React (Vite), всё в docker compose за nginx.

## Данные

Список преподавателей загружается из CSV с колонками `Курс,Предмет,Преподаватель`:

```bash
python manage.py load_teachers путь/к/файлу.csv
```

## Запуск

```bash
cp .env.example .env
docker compose up -d --build
```

Для разработки: `docker-compose.dev.yml` (фронтенд отдельно, `npm run dev`).
