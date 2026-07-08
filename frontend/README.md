# Frontend: Оценка преподавателей

React + Vite + TypeScript SPA для взаимодействия с Django REST API teacher-ranking.

## Стек

- React 19 + Vite 6 + TypeScript 5
- Tailwind CSS 4
- shadcn/ui (ручная сборка компонентов)
- TanStack Query 5
- React Router 7
- Geist + Geist Mono
- Phosphor Icons

## Запуск через Docker Compose

### Production

```bash
docker compose up --build
```

Frontend будет доступен на `http://localhost`. Nginx раздает собранный frontend и проксирует `/api`, `/admin`, `/static`, `/media` в Django.

### Development

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Backend: `http://localhost:8000`
- Frontend dev server: `http://localhost:5173` (с hot reload и proxy `/api` на backend)

## Локальный запуск

```bash
cd frontend
npm install
npm run dev
```

Приложение откроется на `http://localhost:5173`.

## Переменные окружения

Скопируйте `.env.example` в `.env`:

```bash
VITE_API_BASE_URL=/api
VITE_API_PROXY=http://localhost:8000
```

`VITE_API_BASE_URL` - публичный путь к API в браузере.  
`VITE_API_PROXY` - адрес backend для Vite dev server (proxy `/api`). В Docker Compose dev указывайте `http://web:8000`.

## Сборка

```bash
npm run build
npm run preview
```

## Структура

- `src/api/` - слой работы с API (клиент, эндпоинты, типы, ресурсы)
- `src/components/ui/` - базовые UI-компоненты
- `src/components/teacher/`, `src/components/rating/`, `src/components/leaderboard/` - предметные компоненты
- `src/hooks/` - TanStack Query хуки
- `src/pages/` - страницы приложения
- `src/providers/` - провайдеры (auth)

## Маршруты

- `/` - главная
- `/teachers` - список преподавателей с фильтрами
- `/teachers/:id` - карточка преподавателя
- `/teachers/:id/rate` - форма оценки (требуется вход)
- `/leaderboard` - рейтинг по категориям
- `/next` - перенаправление на следующего неоцененного преподавателя
- `/login` - вход по имени
