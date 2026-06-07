import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Статьи-презентации — коллекция (каждая статья = отдельная страница /articles/<slug>).
 * Остальной контент (hero, плитки, достопримечательности, галерея, маршруты, инфо,
 * заведения, отели) хранится массивами в src/data/*.json и редактируется в Keystatic.
 */
const articles = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/articles' }),
  schema: z.object({
    order: z.number(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    slides: z.array(z.object({ caption: z.string() })),
  }),
});

export const collections = { articles };
