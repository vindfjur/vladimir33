import { config, collection, singleton, fields } from '@keystatic/core';

/**
 * Локальная панель управления контентом (Keystatic).
 * Открывается на /keystatic при запуске `npm run dev`. Правит те же файлы
 * (src/data/*.json и src/content/articles/*), что читает сайт. Это для контента
 * (тексты, фото, добавить/убрать заведения и т.п.), а не для дизайна.
 */

const place = fields.object(
  {
    name: fields.text({ label: 'Название' }),
    detail: fields.text({ label: 'Кухня / тип' }),
    city: fields.text({ label: 'Город' }),
    website: fields.url({ label: 'Сайт' }),
  },
  { label: 'Место' }
);

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Владимир-33' },
    navigation: {
      'Статьи и галерея': ['articles', 'gallery', 'heroSlides'],
      'Разделы': ['tiles', 'attractions', 'routes', 'info'],
      'Карта · заведения': ['foodPlaces', 'stayPlaces'],
    },
  },

  collections: {
    articles: collection({
      label: 'Статьи-презентации',
      path: 'src/content/articles/*',
      format: { data: 'json' },
      slugField: 'slug',
      columns: ['title'],
      schema: {
        slug: fields.slug({ name: { label: 'Идентификатор (латиницей)' } }),
        order: fields.integer({ label: 'Порядок', defaultValue: 1 }),
        title: fields.text({ label: 'Заголовок' }),
        description: fields.text({ label: 'Краткое описание', multiline: true }),
        slides: fields.array(
          fields.object({ caption: fields.text({ label: 'Текст слайда', multiline: true }) }),
          { label: 'Слайды', itemLabel: (p) => p.fields.caption.value.slice(0, 50) || 'Слайд' }
        ),
      },
    }),
  },

  singletons: {
    heroSlides: singleton({
      label: 'Главный экран (слайды)',
      path: 'src/data/slides',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({ label: 'Заголовок' }),
            lead: fields.text({ label: 'Выделенное начало' }),
            body: fields.text({ label: 'Текст', multiline: true }),
            image: fields.image({ label: 'Фон', directory: 'public/backgrounds', publicPath: '/backgrounds/' }),
          }),
          { label: 'Слайды', itemLabel: (p) => p.fields.title.value || 'Слайд' }
        ),
      },
    }),

    gallery: singleton({
      label: 'Фотогалерея',
      path: 'src/data/gallery',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({ label: 'Название' }),
            description: fields.text({ label: 'Описание', multiline: true }),
            image: fields.image({ label: 'Фото', directory: 'public/images/gallery', publicPath: '/images/gallery/' }),
          }),
          { label: 'Фотографии', itemLabel: (p) => p.fields.title.value || 'Фото' }
        ),
      },
    }),

    attractions: singleton({
      label: 'Архитектура (карточки)',
      path: 'src/data/attractions',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            slug: fields.text({ label: 'Идентификатор статьи (латиницей)' }),
            title: fields.text({ label: 'Заголовок' }),
            description: fields.text({ label: 'Описание', multiline: true }),
            image: fields.image({ label: 'Фото', directory: 'public/images/attractions', publicPath: '/images/attractions/' }),
          }),
          { label: 'Карточки', itemLabel: (p) => p.fields.title.value || 'Карточка' }
        ),
      },
    }),

    tiles: singleton({
      label: '10 открытий Владимира',
      path: 'src/data/tiles',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            n: fields.text({ label: 'Число (прописью)' }),
            topic: fields.text({ label: 'Тема' }),
            text: fields.text({ label: 'Описание', multiline: true }),
          }),
          { label: 'Плитки', itemLabel: (p) => `${p.fields.n.value} — ${p.fields.topic.value}` }
        ),
      },
    }),

    routes: singleton({
      label: 'Туристические маршруты',
      path: 'src/data/routes',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({ label: 'Название кольца' }),
            duration: fields.text({ label: 'Длительность' }),
            summary: fields.text({ label: 'Описание', multiline: true }),
            color: fields.text({ label: 'Цвет (HEX)', defaultValue: '#c08a2d' }),
            stops: fields.array(
              fields.object({
                label: fields.text({ label: 'Время / день' }),
                title: fields.text({ label: 'Точка' }),
                text: fields.text({ label: 'Описание', multiline: true }),
              }),
              { label: 'Точки маршрута', itemLabel: (p) => p.fields.title.value || 'Точка' }
            ),
          }),
          { label: 'Маршруты', itemLabel: (p) => p.fields.title.value || 'Маршрут' }
        ),
      },
    }),

    info: singleton({
      label: 'Как добраться',
      path: 'src/data/info',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({ label: 'Способ' }),
            text: fields.text({ label: 'Описание', multiline: true }),
          }),
          { label: 'Карточки', itemLabel: (p) => p.fields.title.value || 'Карточка' }
        ),
      },
    }),

    foodPlaces: singleton({
      label: 'Где перекусить',
      path: 'src/data/food-pool',
      format: { data: 'json' },
      schema: { items: fields.array(place, { label: 'Заведения', itemLabel: (p) => p.fields.name.value || 'Место' }) },
    }),

    stayPlaces: singleton({
      label: 'Где остановиться',
      path: 'src/data/stay-pool',
      format: { data: 'json' },
      schema: { items: fields.array(place, { label: 'Отели', itemLabel: (p) => p.fields.name.value || 'Место' }) },
    }),
  },
});
