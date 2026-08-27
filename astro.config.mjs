// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://graceafterthegrave.com',
  integrations: [
    sitemap({
      // Filter out Astro internal paths
      filter: (page) =>
        !page.includes('/404') &&
        !page.includes('/_astro/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});