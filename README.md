<div align="center">

# 🏛️ Владимир‑33

### Путеводитель по Владимирской области

Одностраничный гид по древней Владимирской земле: герой‑слайдер, «10 открытий»,
архитектурное наследие, интерактивная карта на 2300+ объектов, туристические
маршруты, подборки кафе и гостиниц, фотогалерея и статьи‑презентации
с русскими фолк‑узорами.

[**🌐 Открыть сайт → vladimir33.vercel.app**](https://vladimir33.vercel.app)

![Astro](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![MapLibre](https://img.shields.io/badge/MapLibre_GL-396CB2?logo=maplibre&logoColor=white)
![OpenStreetMap](https://img.shields.io/badge/data-OpenStreetMap-7EBC6F?logo=openstreetmap&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-C9A227.svg)

</div>

---

## 📖 История

Сайт создан в **ноябре–декабре 2024 года** как учебный проект.
**Восстановлен и полностью обновлён в июне 2026 года** — пересобран с нуля на Astro
в чистую статику под лицензией MIT, с сохранением узнаваемых фишек и темы древней Руси.

## ✨ Что внутри

- 🎞️ **Герой‑слайдер** с плавной сменой видов и свайпами на мобильных
- 🔟 **«10 открытий»** — фирменные плитки‑витрина региона
- 🏰 **Архитектурное наследие** + статьи‑презентации на бесшовных русских орнаментах
- 🗺️ **Интерактивная карта** — 2300+ объектов из OpenStreetMap (музеи, кафе, отели,
  достопримечательности, природа), без обращений к API у посетителя
- 🧵 **Туристические маршруты** — флип‑карточки на «верёвочке с флажками»
- 🍞 **Где перекусить / где остановиться** — подборки заведений
- 🖼️ **Фотогалерея** с лайтбоксом и жестами
- 🎨 **Тема древней Руси** — пергамент, золото, терракота, синь; типографика на
  Forum / PT Serif / PT Sans

## 🚀 Запуск

```bash
npm install
npm run dev      # сайт на http://localhost:4321
npm run build    # статическая сборка в dist/
npm run preview  # предпросмотр собранного
```

## 🛠️ Стек

| Слой | Технология |
|------|------------|
| Фреймворк | [Astro 5](https://astro.build) (SSG, вывод — статика) + TypeScript |
| Карта | [MapLibre GL](https://maplibre.org) + стиль [OpenFreeMap Positron](https://openfreemap.org) (без ключей) |
| Данные карты | [OpenStreetMap](https://www.openstreetmap.org) / Overpass (ODbL) |
| CMS (только dev) | [Keystatic](https://keystatic.com) в local‑режиме |
| Шрифты | Forum, PT Serif, PT Sans ([@fontsource](https://fontsource.org), OFL) |
| Хостинг | [Vercel](https://vercel.com) |

## 🧩 Панель управления контентом (Keystatic)

В режиме разработки доступен дашборд для правки контента **без кода**:

```bash
npm run dev      # затем открыть http://localhost:4321/keystatic
```

Через него можно: создавать и редактировать статьи‑презентации; менять фотографии
галереи, архитектурных карточек и главного экрана (загрузка прямо в браузере);
добавлять/убирать заведения, точки маршрутов, карточки «Как добраться» и плитки.

Дашборд правит те же файлы (`src/data/*.json`, `src/content/articles/*`), что читает
сайт. CMS подключается только локально, поэтому продакшен‑сборка остаётся полностью
статической.

## 📁 Структура

```
src/
  pages/            страницы (index, articles/[slug])
  components/       секции-компоненты (Hero, Tiles, MapSection, Routes, …)
  layouts/          Base.astro
  content/articles/ статьи-презентации (коллекция)
  data/*.json       контент секций (hero, плитки, галерея, маршруты, заведения…)
  styles/global.css дизайн-система (токены темы, типографика)
public/
  images/           фотографии (галерея, архитектура)
  backgrounds/      фоны главного экрана
  data/*.geojson    граница области и точки карты (из OpenStreetMap)
  favicon/
scripts/
  fetch-osm.mjs     сборка данных карты (граница + POI) из Overpass
  build-pools.mjs   сборка списков кафе/гостиниц из OpenStreetMap
keystatic.config.ts конфигурация дашборда
```

## 🗺️ Данные карты

Граница Владимирской области и объекты берутся из **OpenStreetMap** и сохраняются
статикой — посетители к API не ходят. Обновить данные:

```bash
node scripts/fetch-osm.mjs     # → public/data/*.geojson
node scripts/build-pools.mjs   # → src/data/food-pool.json, stay-pool.json
```

## 📜 Лицензии

Исходный код — **MIT**, © 2024–2026 vindfjur (см. [`LICENSE`](LICENSE)).

Медиа лицензируются отдельно (см. [`ASSETS.md`](ASSETS.md)): личные фото галереи —
все права защищены; фоны и превью архитектуры — стороннее (заменить перед
коммерческим использованием); данные карты © OpenStreetMap (ODbL), подложка —
OpenFreeMap; шрифты — SIL OFL.

---

<div align="center">
<sub>Сделано с любовью к Владимирской земле · 2024 → 2026</sub>
</div>
