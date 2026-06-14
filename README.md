<div align="center">
# LearnForge
 
**Комплексная платформа для репетиторов — управление уроками, школами и администрированием в одном месте.**
 
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![MUI](https://img.shields.io/badge/MUI-v9-007FFF?logo=mui&logoColor=white)](https://mui.com)
 
</div>
---
 
## Содержание
 
- [О проекте](#о-проекте)
- [Возможности](#возможности)
- [Технологический стек](#технологический-стек)
- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [Структура проекта](#структура-проекта)
- [Архитектура](#архитектура)
- [API](#api)
- [Соглашения по коду](#соглашения-по-коду)
- [Тестирование](#тестирование)
- [Деплой](#деплой)
---
 
## О проекте
 
LearnForge — SPA для репетиторов и владельцев школ с модульной архитектурой.
 
Бэкенд: REST API. Мультитенантная архитектура — каждая школа живёт в отдельной базе данных. Авторизация через JWT-токен и Refresh-токен (сохраняется в LocalStorage и обновляется через `/refreshToken` в API-клиенте с `withCredentials: true`).
 
---
 
## Возможности
 
### Реализованные модули
 
| Модуль | Описание | Ключевая технология |
|---|---|---|
| **Lessons** | Файловый менеджер для уроков в стиле Google Drive. Создание, редактирование, организация по папкам и интерактивный редактор Lexical | Lexical, Files API, KaTeX, Desmos API |
| **Auth** | Авторизация и регистрация пользователей (роли: создатель школы, учитель, студент) | REST API, Local Storage |
| **AdminPanel** | Панель управления платформой, список школ, одобрение заявок на создание школ, маркетплейс модулей (заглушка) | REST API, Zustand / Context |
| **Schools** | Обзорный экран школы и управление её структурой | REST API |
 
### Модули в разработке (Roadmap)
 
| Модуль | Описание | Планируемая технология |
|---|---|---|
| **Scheduling** | Расписание занятий, бронирование слотов, управление сессиями | FullCalendar |
| **Chat** | Групповые и личные чаты в реальном времени | SignalR `/chatHub`, `/directChatHub` |
| **Whiteboard** | Совместная интерактивная доска во время сессии | SignalR, Canvas API |
| **Students** | Управление базой студентов, профили, история занятий | REST API |
| **Voice Calls** | WebRTC аудио/видео звонки | `/voiceCallHub` |
 
---
 
## Технологический стек
 
### Ядро
| Назначение | Технология |
|---|---|
| Фреймворк | React 19 + TypeScript 5.9 |
| Сборка | Vite 7 |
| UI-компоненты | MUI v9 (`@mui/material` ^9.0.0) |
| Роутинг | React Router v7 (`react-router-dom` ^7.11.0) |
 
### Состояние и данные
| Назначение | Технология |
|---|---|
| Серверное состояние | TanStack Query v5 |
| Глобальное / сессионное состояние | Zustand 5 + React Context (UserContext, LessonsContext) |
| HTTP-клиент | Axios + axios-retry |
 
### Функциональные модули
| Назначение | Технология |
|---|---|
| Редактор уроков | Lexical |
| Математика | KaTeX |
| Графики | Desmos API |
 
### Разработка и тесты
| Назначение | Технология |
|---|---|
| Unit / Integration | Vitest + Testing Library |
| API-моки | MSW 2 |
| Линтинг | ESLint 9 |
 
---
 
## Быстрый старт
 
### Требования
 
- Node.js ≥ 20
- npm ≥ 10
- Запущенный LearnForge API (см. репозиторий бэкенда)
### Установка
 
```bash
git clone https://github.com/your-org/learnforge-frontend.git
cd learnforge-frontend
npm install
```
 
### Запуск в режиме разработки
 
```bash
npm run dev
```
 
Приложение откроется на [http://localhost:5173](http://localhost:5173).
 
### Остальные команды
 
```bash
npm run build          # продакшн-сборка → dist/
npm run preview        # предпросмотр продакшн-сборки
npm run lint           # ESLint
npm run test           # Vitest (unit-тесты)
npm run deploy         # сборка и деплой на GitHub Pages
```
 
---
 
## Переменные окружения
 
Создайте `.env.local` в корне проекта (файл не попадает в git):
 
```dotenv
# Ссылки на бэкенд REST API
VITE_API_BASE_URL=http://localhost:5000
VITE_SERVER_LINK=http://localhost:5000
VITE_SERVER_HEALTH=http://localhost:5000/health
```
 
> **Важно.** Все `VITE_`-переменные встраиваются в бандл в виде открытого текста. Никогда не кладите в них секреты — только публичные URL и идентификаторы.
 
Полный список переменных:
 
| Переменная | Обязательна | Описание |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Базовый URL бэкенда для Lessons API |
| `VITE_SERVER_LINK` | ✅ | Базовый URL бэкенда для Auth/Admin API |
| `VITE_SERVER_HEALTH`| ❌ | URL для проверки работоспособности сервера |
 
---
 
## Структура проекта
 
```
src/
│
├── Assets/                        # Глобальные, сервис-агностичные ресурсы
│   ├── Art/                       # SVG-иконки и иллюстрации
│   ├── Components/                # Переиспользуемые UI-компоненты (≥2 сервисов)
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── DataTable/
│   │   └── NotificationToast/
│   ├── Hooks/                     # Кросс-сервисные хуки
│   │   ├── useNotification/
│   │   ├── useSignalR/
│   │   └── useDebounce/
│   └── Theme.css                  # Дизайн-токены: цвета, шрифты, отступы
│
├── Endpoints/                     # Весь сетевой слой
│   ├── factory.ts                 # Фабрика axios: куки-авторизация, retry, refresh
│   ├── auth.endpoints.ts
│   ├── files.endpoints.ts         # Files API → уроки
│   ├── files.types.ts             # ApiFile, helpers isLessonFile(), apiFileToLesson()
│   └── index.ts                   # Barrel-экспорт
│
├── Storage/                       # Состояние
│   └── Context/
│       ├── useGlobalContext.ts    # Zustand: auth, config (модули), уведомления
│       └── useLessonsContext.ts   # React Context: UI-состояние файлового менеджера
│
├── Services/                      # Фичи — один каталог на поверхность продукта
│   ├── Lessons/                   # Файловый менеджер + редактор
│   ├── Scheduling/                # Расписание (FullCalendar)
│   ├── Chat/                      # Чат (SignalR)
│   ├── Whiteboard/                # Доска (SignalR + Canvas)
│   ├── Students/                  # Управление студентами
│   └── Settings/                  # Настройки модулей
│
├── Router/
│   ├── AppRouter.tsx
│   ├── routes.ts
│   ├── ProtectedRoute.tsx
│   ├── RoleGuard.tsx
│   └── LessonEditorRoute.tsx      # Routing glue: загрузка контента → Editor
│
├── App.tsx                        # Composition root: провайдеры
└── main.tsx
```
 
### Структура компонента
 
Каждый компонент — это мини-пакет со строгим разделением ответственности:
 
```
ComponentName/
  ComponentName.tsx          ← JSX + обработчики событий
  ComponentName.styles.ts    ← sx-объекты MUI (никаких inline-sx в tsx)
  ComponentName.types.ts     ← Props-интерфейс, локальные enum-ы
  ComponentName.const.ts     ← Константы, CSS-классы, дефолты
  ComponentName.test.tsx     ← Vitest + Testing Library
  utils.ts                   ← Чистые функции (без React)
  hooks/                     ← Хуки, специфичные только для этого компонента
    hookName/
      hook.ts
      hook.types.ts
      tests/
```
 
---
 
## Архитектура
 
### Модель состояния
 
```
Источник правды          Технология               Что хранит
─────────────────────────────────────────────────────────────────
Серверное состояние  →   TanStack Query      →   Список уроков, школы, заявки
UI-состояние страницы →  React Context       →   Папка, режим отображения, поиск, сортировка уроков
Глобальное/Сессионное →  Zustand / LocalStorage → Сессия авторизованного пользователя
Локальные предпочтения → localStorage        →   Свойства локальных папок
```
 
**Правило:** компонент никогда не вызывает `fetch` или `axios` напрямую. Любой сетевой вызов проходит через слой `Endpoints/`. TanStack Query владеет жизненным циклом кеша. Zustand и React Context (UserContext) хранят глобальное состояние сессии пользователя.
 
### API-клиент
 
Эндпоинты оборачиваются в клиент axios c `withCredentials: true`. При получении ошибки 401 автоматически выполняется запрос на `/refreshToken` (POST), обновляющий токены, после чего оригинальный запрос повторяется. В случае неудачи обновления сессии происходит выход из системы (`logout`).
 
---
 
## API
 
### Ключевые факты для разработчика
 
| Параметр | Значение |
|---|---|
| Базовый URL | Определяется через `VITE_API_BASE_URL` или `VITE_SERVER_LINK` |
| Авторизация | Токены (JWT + Refresh), отправка куки-сессии с `withCredentials: true` |
| Мультитенантность | Запросы к файлам и школам требуют `schoolId` / `schoolPublicId` |
| Хранилище файлов | Загрузка файлов через API `/api/ApiFiles` |
 
### Поток загрузки файла (presigned upload)
 
```
1. POST /api/ApiFiles/{schoolId}/direct-upload/presign
   body: { fileName, sizeBytes }
   ← { uploadUrl, storageKey }
 
2. PUT {uploadUrl}
   body: содержимое файла (нативный fetch, БЕЗ credentials)
 
3. POST /api/ApiFiles/{schoolId}/direct-upload/complete
   body: { storageKey, fileName, sizeBytes }
   ← ApiFile
```
 
### Коды ответов
 
| Код | Сценарий |
|---|---|
| 200 / 201 | Успех |
| 401 | Токен истек / неавторизован → клиент пытается выполнить refresh автоматически |
| 409 | Конфликт (например, имя пользователя уже занято) |
| 5xx | Ошибка сервера → axios-retry делает 3 повторные попытки с экспоненциальной задержкой |
 
---
 
## Соглашения по коду
 
### Именование
- Компоненты и типы — `PascalCase`
- Хуки — `camelCase` с префиксом `use`
- Константы — `UPPER_SNAKE_CASE`
- Файлы компонентов — `ComponentName.tsx` (сопутствующие стили — `ComponentName.css` или `ComponentName.styles.ts`)
 
### Архитектурные правила
- Все стилевые правила выносятся в отдельные файлы (`.css` или `.styles.ts`). Не используйте inline стили и сложные `sx` props внутри `.tsx` файлов (см. [AGENTS.md](file:///Users/zhoyd/WebstormProjects/Frontend/AGENTS.md)).
- Компоненты никогда не делают прямые сетевые вызовы.
- Общие компоненты, которые используются более чем в одной фиче, выносятся в `src/Assets/Components/`.
 
### Сетка уровней состояния
 
Перед тем как сохранять данные, определите уровень доступности:
 
```
Нужно только одному компоненту?  → useState / useReducer
Нужно компонентам одной страницы? → React Context (например, useLessonsContext)
Нужно глобально для всего приложения? → Zustand (useGlobalContext) / UserContext
```
 
---
 
## Тестирование
 
### Unit-тесты (Vitest + Testing Library)
 
Тестируют один компонент или хук в изоляции. Все API-вызовы мокируются.
 
```bash
npm run test
```
 
### Integration-тесты (Vitest + MSW)
 
Тестируют хук + реальный код эндпоинта + MSW-мок сервера. Запускаются вместе с unit.
 
---
 
## Деплой
 
### GitHub Pages (по умолчанию)
 
```bash
npm run build
# Содержимое dist/ деплоится на GitHub Pages через GitHub Actions
```
 
Конфигурация CI — `.github/workflows/deploy.yml`.
 
### Продакшн (CDN + S3)
 
1. `npm run build` — создаёт `dist/`
2. Загрузить `dist/` в S3/CloudFront или аналог
3. Настроить перенаправление всех маршрутов на `index.html` (SPA-режим)
4. Выставить заголовок `Cache-Control: no-cache` для `index.html`, `immutable, max-age=31536000` для `assets/*`
### Content Security Policy
 
Рекомендуемый CSP-заголовок (настраивается на CDN/nginx):
 
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://www.desmos.com;
  frame-src https://www.desmos.com;
  img-src 'self' data: https://<cdn-domain>;
  connect-src 'self' https://<api-domain> wss://<api-domain>;
```
 
---
 
## Контрибьютинг
 
1. Создайте ветку от `main`: `git checkout -b feat/my-feature`
2. Убедитесь, что линтер и тесты проходят: `npm run lint && npm run test`
3. Создайте PR с описанием изменений и скриншотом UI (если визуальные изменения)
### Добавление нового модуля
 
1. Создайте `src/Services/ModuleName/` по структуре выше.
2. Опишите эндпоинты в `src/Endpoints/` при необходимости.
3. Добавьте маршруты нового модуля в `src/AppRoutes.tsx`.
4. Интегрируйте навигацию в соответствующий макет: `src/layouts/PublicLayout.tsx` или `src/Services/AdminPanel/AdminPanelLayout/AdminPanelLayout.tsx`.
---
 
<div align="center">
<sub>LearnForge Frontend · React 19 · TypeScript 5.9 · Vite 7</sub>
</div>