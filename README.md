## Melinda 
Melinda — веб-приложение, позволяющее создавать свои собственные калейдоскопические 
визуализации.

### Зависимости
Melinda использует:
* Библиотеку [Graphemescope](https://github.com/Grapheme/graphemescope) для рисования калейдоскопов
* CoffeeScript, Express — на стороне сервера
* CouchDB для хранения данных
* Grunt для сборки клиентских скриптов

### Структура проекта
* `models/` соответствующие CRUD модели сервера
* `app/` front-end логика (исходные файлы)
* `static/` статичные файлы (включая собранные скрипты)
* `scaffold/` инструменты для подготовки базы данных (начальная структура базы и ресурсы главного Скоупа)

### Сборка клиентских скриптов
Для сборки клиентских скриптов используется инструмент Grunt:
```
npm install -g grunt-cli
grunt
```

### Подготовка базы данных
Скрипт инициализирует базу данных (откатывает до начального состояния и удаляет все Скоупы!):
```
npm run-script scaffold
```

### Запуск
```
npm install
npm start
```

