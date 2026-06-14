# Документация API LearnForge

Эта документация предназначена для фронтенд-разработчиков. API построено на принципах REST для обычных запросов и SignalR для real-time взаимодействия.

---

## 1. Общая информация

### Базовый URL
Все запросы к API начинаются с `/api/`. SignalR-хабы доступны по путям `/chatHub`, `/directChatHub`, `/voiceCallHub`.

### Авторизация
*   **Метод:** JWT-токен в Cookies.
*   **Название куки:** `auth_token`.
*   **Установка:** Кука устанавливается автоматически сервером при успешном вызове `/api/ApiAuth/login` или `/api/ApiAuth/reg`.
*   **Роли:** Доступ к ресурсам школы ограничен ролями (`Student`, `Teacher`, `Owner`). Многие эндпоинты требуют заголовка или параметра `schoolPublicId` для проверки прав.

### Формат ответов при ошибках
Сервер использует стандартные HTTP-коды. Тело ответа при ошибках (400, 401, 403, 404, 409) обычно содержит строку с описанием ошибки или объект `ModelState`.

---

## 2. REST API

### 2.1. Аутентификация (`/api/ApiAuth`)

| Метод | Путь | Описание | Авторизация |
| :--- | :--- | :--- | :--- |
| POST | `/api/ApiAuth/reg` | Регистрация нового пользователя | Anonymous |
| POST | `/api/ApiAuth/login` | Вход в систему | Anonymous |
| POST | `/api/ApiAuth/refreshToken` | Обновление JWT по Refresh Token | Any |
| POST | `/api/ApiAuth/join-school` | Присоединение к школе по инвайту | [Authorize] |
| POST | `/api/ApiAuth/invite` | Создание инвайта в школу | Teacher/Owner |

#### Пример: Вход (Login)
**Request Body (`LoginModel`):**
```json
{
  "name": "username",
  "password": "password123"
}
```
**Response (200 OK):**
```json
{
  "jwtToken": "eyJhbG...",
  "refreshToken": "uuid-string",
  "userName": "username",
  "userPublicId": "user-guid",
  "userRoles": [
    { "role": 0, "schoolId": 1, "userId": 10 }
  ]
}
```

---

### 2.2. Школы и Управление (`/api/ApiSchool` и `/api/ApiAuth`)

| Метод | Путь | Описание | Роли |
| :--- | :--- | :--- | :--- |
| GET | `/api/ApiSchool/my-schools` | Список школ пользователя | Любой авторизованный |
| POST | `/api/ApiAuth/request-school` | Заявка на создание школы | Любой авторизованный |
| GET | `/api/ApiAuth/request-school/{publicId}/status` | Статус заявки на создание школы | Любой авторизованный |
| GET | `/api/ApiAuth/request-school/all` | Список заявок (админ) | Admin |

---

### 2.3. Ветки / Групповые чаты (`/api/ApiBreanches`)

| Метод | Путь | Описание | Параметры |
| :--- | :--- | :--- | :--- |
| GET | `/api/ApiBreanches/{schoolId}/all` | Все ветки школы | `schoolId` (route) |
| POST | `/api/ApiBreanches/{schoolId}/createBreanch`| Создать ветку | `Name`, `Description` (body) |
| GET | `/api/ApiBreanches/{schoolId}/{id}/files` | Файлы ветки | `id` (int) |

---

### 2.4. Работа с файлами (`/api/ApiFiles`)

Система работает с **MinIO**. Есть два способа загрузки: классический (multipart) и через Presigned URL.

| Метод | Путь | Описание | Тип контента |
| :--- | :--- | :--- | :--- |
| GET | `/api/ApiFiles/{schoolId}` | Список файлов школы | JSON |
| POST | `/api/ApiFiles/{schoolId}` | Загрузка файла на сервер | `multipart/form-data` |
| POST | `/api/ApiFiles/{schoolId}/direct-upload/presign` | Получение ссылки для загрузки напрямую в MinIO | JSON |
| POST | `/api/ApiFiles/{schoolId}/direct-upload/complete` | Подтверждение загрузки после S3 upload | JSON |
| GET | `/api/ApiFiles/{schoolId}/{fileId}/content` | Скачивание файла | Stream |
| DELETE | `/api/ApiFiles/{schoolId}/{fileId}` | Удаление файла | - |

#### Прямая загрузка (Direct Upload):
1. Вызвать `.../presign`, передать `fileName`, `sizeBytes`.
2. Получить `uploadUrl` (действует 15 мин) и `storageKey`.
3. Выполнить `PUT` запрос на `uploadUrl` с телом файла.
4. Вызвать `.../complete`, передав `storageKey` и метаданные.

---

### 2.5. Конференции Jitsi Meet (`/api/ApiMeet`)

| Метод | Путь | Описание | Особенности |
| :--- | :--- | :--- | :--- |
| POST | `/api/ApiMeet/token` | Получить JWT для Jitsi | Возвращает `roomUrl` с токеном |
| POST | `/api/ApiMeet/screen-share/request` | Запрос на расшаривание экрана | Для учеников |
| POST | `/api/ApiMeet/screen-share/approve` | Одобрение расшаривания | Только Teacher/Owner |
| POST | `/api/ApiMeet/whiteboard/archive-pointer` | Сохранить ссылку на доску Excalidraw | После завершения сессии |

---

### 2.6. Конструктор уроков (`/lessons`)

| Метод | Путь | Описание | Роли |
| :--- | :--- | :--- | :--- |
| GET | `/lessons` | Получить список уроков | Любой авторизованный |
| GET | `/lessons/{id}` | Получить урок по ID | Любой авторизованный |
| POST | `/lessons` | Создать новый урок | Teacher/Owner |
| PATCH | `/lessons/{id}` | Обновить свойства урока | Teacher/Owner |
| DELETE | `/lessons/{id}` | Удалить урок | Teacher/Owner |
| GET | `/lessons/folders` | Получить папки уроков | Любой авторизованный |
| POST | `/lessons/folders` | Создать папку для уроков | Teacher/Owner |
| PATCH | `/lessons/folders/{id}` | Обновить папку | Teacher/Owner |
| DELETE | `/lessons/folders/{id}` | Удалить папку | Teacher/Owner |

---

## 3. SignalR Hubs

Все хабы требуют авторизации. Токен берется из куки `auth_token` автоматически.

### 3.1. Групповой чат (`/chatHub`)

**Параметры подключения (Query String):**
*   `schoolPublicId`: GUID школы
*   `breanchId`: ID ветки

**Методы клиента (вызов сервера):**
*   `SendMessageToBreanch(schoolPublicId, breanchId, message)` — отправить сообщение в ветку.

**События сервера (приходят клиенту):**
*   `ReceiveMessage(senderName, message)` — новое сообщение в чате.

---

### 3.2. Личный чат (`/directChatHub`)

**Параметры подключения (Query String):**
*   `schoolPublicId`: GUID школы
*   `otherUserId`: PublicId собеседника

**Методы клиента:**
*   `SendMessageToDirect(schoolPublicId, receiverPublicId, message)`

**События сервера:**
*   `ReceiveMessage(senderName, message)`

---

### 3.3. Голосовые вызовы (`/voiceCallHub`)

Используется для WebRTC сигналинга.

**Методы клиента:**
1.  `InitiateCall(schoolPublicId, receiverUserId)` — начать звонок.
2.  `AcceptCall(schoolPublicId, callId)` — принять.
3.  `RejectCall/EndCall(schoolPublicId, callId)` — отклонить/завершить.
4.  `SendOffer/SendAnswer/SendIceCandidate(schoolPublicId, callId, data)` — передача WebRTC данных.

**События сервера:**
*   `IncomingCall(callId, initiatorName, initiatorId, schoolId)` — входящий вызов.
*   `CallAccepted(callId)` / `CallRejected(callId)` / `CallEnded(callId)`.
*   `ReceiveOffer(callId, offer)` / `ReceiveAnswer(callId, answer)` / `ReceiveIceCandidate(callId, candidate)`.

---

## 4. Пример подключения на клиенте (JS)

```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub?schoolPublicId=GUID&breanchId=123")
    .withAutomaticReconnect()
    .build();

connection.on("ReceiveMessage", (user, message) => {
    console.log(`${user}: ${message}`);
});

async function start() {
    try {
        await connection.start();
        console.log("SignalR Connected.");
    } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
    }
};

start();
```

---

## 5. Коды ответов

| Код | Сценарий |
| :--- | :--- |
| **200 OK** | Успешное выполнение. |
| **202 Accepted** | Запрос принят на обработку (например, создание БД школы). |
| **400 Bad Request** | Ошибка валидации или неверные параметры. |
| **401 Unauthorized** | Отсутствует или просрочен токен в куках. |
| **403 Forbidden** | Недостаточно прав (например, ученик пытается удалить ветку). |
| **404 Not Found** | Ресурс (школа, ветка, файл) не найден. |
| **409 Conflict** | Конфликт состояния (например, пользователь уже в школе). |
| **429 Too Many Requests** | Превышен лимит запросов (Rate Limiting на Auth эндпоинтах). |
| **502 Bad Gateway** | Ошибка внешнего сервиса (MinIO/Jitsi). |

**Важно:** Для всех операций внутри школы всегда передавайте актуальный `schoolPublicId`, так как архитектура системы — **Multi-tenant (database-per-tenant)**, и серверу нужно знать, к какой базе данных подключаться.