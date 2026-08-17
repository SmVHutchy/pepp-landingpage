import { defineConfig } from 'astro/config';
import { SITE } from './src/data/site.js';

// Statische Marketing-Seite, kein Anwendungszustand, kein SPA-Framework.
export default defineConfig({
  site: SITE.origin,
  output: 'static',
  trailingSlash: 'never',
  build: {
    // Rechtsseiten als /impressum statt /impressum/index.html
    format: 'file',
    inlineStylesheets: 'always',
  },
  image: {
    // Prototyp-Screens sind 780x1688 PNGs -> WebP/AVIF beim Build
    responsiveStyles: false,
  },
  devToolbar: { enabled: false },
});
