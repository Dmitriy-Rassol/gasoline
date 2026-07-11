# Карта наличия топлива на АЗС — Череповец

Веб-приложение для отображения актуальной информации о наличии топлива на автозаправочных станциях городского округа Череповец на интерактивной карте.

## Возможности

- **Интерактивная карта** — Яндекс.Карта с маркерами АЗС (зелёные — есть топливо, красные — нет)
- **Список АЗС** — быстрый поиск по названию и адресу
- **Фильтрация** — по бренду, наличию топлива и типу (АИ-92, АИ-95, АИ-98, ДТ)
- **Карточка станции** — объёмы топлива, последний комментарий, история поставок
- **Адаптивный дизайн** — десктоп (sidebar + карта) и мобильная версия (bottom sheet)

## Бренды

Лукойл · Газпромнефть · Татнефть · Teboil · Энтиком-Инвест · Эспо

## Стек

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [vue-yandex-maps v3](https://vue-yandex-maps.netlify.app/)
- [Lucide Vue](https://lucide.dev/) — иконки
- SCSS

## Запуск

```bash
cd frontend_gasoline
npm install
npm run dev
```

Сборка:

```bash
npm run build
```

## Структура

```
frontend_gasoline/
├── src/
│   ├── assets/           # логотипы брендов, изображения
│   ├── components/
│   │   ├── AppNavbar.vue     # навигационная панель
│   │   ├── FuelFilters.vue   # фильтры (sidebar / bottom sheet)
│   │   ├── StationList.vue   # список АЗС с поиском
│   │   └── YandexMap.vue     # карта с маркерами и попапами
│   ├── data/
│   │   └── stations.ts       # данные АЗС (28 станций)
│   ├── types/
│   │   └── station.ts        # типы и константы
│   ├── App.vue               # корневой компонент
│   └── main.ts               # точка входа
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```
