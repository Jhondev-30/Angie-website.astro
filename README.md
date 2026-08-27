# graceafterthegrave.com

Sitio web personal de **Angie Pichardo** — Christian motivational speaker, life coach y creadora del A.L.I.G.N. Framework. Desplegado en [graceafterthegrave.com](https://graceafterthegrave.com) sobre Vercel.

Construí este sitio con foco en tres cosas: SEO fuerte (para que aparezca en Google cuando alguien busca a Angie), performance real (LCP verde en mobile) y un look editorial que respete la marca.

## Stack

- **[Astro 7](https://astro.build)** — framework principal. Output 100% estático, sin runtime JS por defecto.
- **[Tailwind CSS 4](https://tailwindcss.com)** via `@tailwindcss/vite`. No uso CLI de Tailwind.
- **`@tailwindcss/typography`** — para contenido tipo blog/Markdown si se necesita.
- **`tailwind-animations`** — animaciones utilitarias declarativas.
- **[GSAP 3](https://gsap.com)** — animaciones de scroll y hover que no entran en CSS plano.
- **[lucide](https://lucide.dev)** + **[morphicons](https://morphicons.com)** — iconos. Lucide para los sociales, morphicons para el menú hamburguesa con morph entre estados.
- **[Sharp](https://sharp.pypi.org)** — procesamiento de imágenes (resize, WebP, AVIF cuando haga falta).
- **TypeScript 7** — estricto en los componentes.
- **[pnpm](https://pnpm.io)** — gestor de dependencias. Lockfile commiteado.
- **`@astrojs/sitemap`** — sitemap nativo que Astro regenera en build.

## Requisitos

- Node `>=22.12.0` (definido en `engines` del `package.json`)
- pnpm 10+

## Setup

```bash
pnpm install
pnpm dev          # servidor local en http://localhost:4321
pnpm build        # genera ./dist (output estático)
pnpm preview      # sirve ./dist localmente para verificar
```

## Estructura

```
/
├── astro.config.mjs        # Configuración Astro + integración sitemap
├── public/
│   ├── fonts/             # WOFF2 con subset (SpaceGrotesk + Fraunces)
│   ├── images/            # WebP optimizadas, hero + services + about
│   ├── og/                # og-default.jpg (1200x630) para Open Graph
│   ├── favicon/
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── MainHead.astro       # SEO meta, schema, preload, OG
│   │   ├── MainFooter.astro     # Footer global
│   │   └── NavBar.astro         # Nav con auto-hide en desktop, fijo en touch
│   ├── content/
│   │   └── services/            # Content collection (Markdown)
│   │       ├── align-purpose-coaching.md
│   │       ├── keynote-speaking.md
│   │       └── podcast-guest-media.md
│   ├── content.config.ts        # Schema Zod de las collections
│   ├── layout/
│   │   ├── MainLayout.astro
│   │   ├── ServicesLayout.astro
│   │   ├── ServicesMainLayout.astro
│   │   └── ServicesHeroLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── aboutme.astro
│   │   ├── store.astro
│   │   ├── wellness.astro
│   │   ├── 404.astro
│   │   └── services/
│   │       ├── coaching.astro
│   │       ├── keynote-speaking.astro
│   │       └── podcast-guest.astro
│   └── styles/
│       └── global.css           # Tailwind + @font-face (WOFF2 con font-display: swap)
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

## Decisiones técnicas

### View Transitions

Uso `<ClientRouter />` de Astro en `MainLayout.astro` para navegación SPA sin flash blanco. El script tiene un **auto-hide del navbar en scroll** que se desactiva automáticamente en dispositivos touch (`window.matchMedia('(hover: hover)')`) — en móvil el navbar siempre está visible para que el botón hamburguesa nunca quede fuera de pantalla.

### Content Collections

Los servicios se manejan como Markdown en `src/content/services/` con un schema Zod en `src/content.config.ts`. Esto permite editar el contenido de cada servicio sin tocar código y mantiene los datos tipados.

Para añadir un servicio nuevo:

1. Crea `src/content/services/nuevo-servicio.md` con frontmatter:
   ```yaml
   ---
   title: "Nombre del Servicio"
   image: "servicio.webp"
   longDescription: "Descripción completa del servicio."
   bestFor:
     - "Audiencia 1"
     - "Audiencia 2"
   format: "In-Person o Virtual"
   duration: "60 min"
   location: "Lemoyne, PA o Zoom"
   url: "services/nuevo-servicio"
   ---
   ```
2. Crea `src/pages/services/nuevo-servicio.astro` usando `ServicesLayout` + `ServicesMainLayout`.
3. La home (`index.astro`) lista el servicio automáticamente — lee la collection con `getCollection("services")`.

### SEO

- **Schema.org JSON-LD** en cada página: `Person` (en MainHead, en todas), `WebPage` con `author`/`reviewedBy`/`publisher`, `FAQPage` (home), `ItemList`+`Service` (home), `ProfessionalService` (home).
- **OG image dedicada** en `public/og/og-default.jpg` (JPG 1200×630, NO WebP — WhatsApp no soporta WebP en previews).
- **Sitemap nativo** vía `@astrojs/sitemap`. Se genera en `/sitemap-index.xml` y `/sitemap-0.xml` automáticamente.
- **`robots.txt`** en `public/robots.txt` con `Sitemap:` directive.
- **Canonical URLs** en cada página vía `Astro.url.pathname`.
- **Geo meta tags** (`geo.region=US-PA`, `geo.placename`, lat/long) para local SEO en Central PA.
- **Google Search Console** verificado vía meta tag `google-site-verification`.

### Performance

- **Fuentes WOFF2 con subset** de solo los caracteres que el sitio usa. Ver `src/styles/global.css` y `public/fonts/`. Originales `.ttf` no se sirven.
- **Preload de fuentes críticas** en `MainHead.astro` (`rel=preload as=font crossorigin`).
- **Preload de la hero image** (`/images/angie-hero-1600.webp`, `fetchpriority=high`).
- **Imágenes WebP** a tamaño 2x del mostrado, recomprimidas con `quality=80, method=6`.
- **`font-display: swap`** en las tres `@font-face` para evitar FOUT invisible durante la carga.
- Sin tracking de terceros (no Google Analytics, no Meta Pixel) — mantiene el sitio limpio y rápido.

## Comandos

| Comando            | Acción                                                 |
| ------------------ | ------------------------------------------------------ |
| `pnpm install`     | Instala dependencias                                   |
| `pnpm dev`         | Dev server con HMR en `http://localhost:4321`           |
| `pnpm build`       | Build de producción → `./dist/`                        |
| `pnpm preview`     | Sirve `./dist/` localmente para QA pre-deploy          |
| `pnpm astro check` | Type-check de los `.astro`                              |

## Deploy

Push a `main` → Vercel hace auto-deploy.

El dominio `graceafterthegrave.com` está gestionado en Hostinger (DNS) y apunta al deploy de Vercel.

### Para añadir una nueva URL al sitemap manualmente

El sitemap se regenera solo en cada `pnpm build`. Después del push, se valida automáticamente en [Google Search Console](https://search.google.com/search-console) → Sitemaps.

### Para cambiar la OG image

Reemplaza `public/og/og-default.jpg` (1200×630, JPG — **no WebP**, WhatsApp no lo soporta). El build copia automáticamente a `dist/og/og-default.jpg`.

## Notas

- Las modificaciones de páginas con cambios visuales deberían pasar por build + smoke test en `localhost:4321` antes de push.
- Si se agregan caracteres nuevos al sitio (otro idioma, emojis, símbolos), hay que regenerar el subset de fuentes. El script vive en `tools/subset-fonts.py` (no commiteado por defecto — recrearlo con `pyftsubset` cuando se necesite).
- El sitio es 100% bilingüe en metadata (`og:locale:alternate=es_ES`) pero el contenido es solo inglés. La versión en español está en el roadmap.
