# Multi-Domain Node.js API Server

Сервер на чистом Node.js, реализующий API для нескольких предметных областей: программирование и армия.

## Запуск
1. `node index.js`
2. Открыть [http://localhost:3000](http://localhost:3000)

---

## Варианты и Данные

### Программирование (Programming Patterns)
* **GET** `/patterns` - получение всех паттернов
    * `name` (string)
    * `complexity` (number)
    * `isPopular` (boolean)
    * `addedDate` (Date string)
    * `tags` (Array)
* **GET** `/patterns/:id` - получение конкретного паттерна по ID
* **GET** `/antipatterns` - получение всех анти-паттернов
    * `name` (string)
    * `riskLevel` (number)
    * `isFixable` (boolean)
    * `discoveryDate` (Date string)
    * `affectedLanguages` (Array)
* **GET** `/antipatterns/:id` - получение конкретного анти-паттерна по ID

### Армия (Army Soldiers)
* **GET** `/soldiers` - получение всех солдат
    * `name` (string)
    * `rank` (number)
    * `isActive` (boolean)
    * `enlistmentDate` (Date string)
    * `skills` (Array)
* **GET** `/soldiers/:id` - получение конкретного солдата по ID
* **POST** `/soldiers` - создание нового солдата

---

## Особенности реализации
1. **Ядро (Framework.js)**: Самописная реализация роутера и middleware.
2. **База данных**: Хранение данных в локальных `.json` файлах в папке `data/`.
3. **Поддержка разных HTTP-методов**: Реализованы GET и POST методы для различных сущностей.
