// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

const withCMS = process.argv.includes('dev');

export default defineConfig({
  site: 'https://vladimir33.vercel.app',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: withCMS ? [react(), keystatic()] : [],
});
