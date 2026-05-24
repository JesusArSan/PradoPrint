# Tienda Prado — Impresiones

Aplicación web de e-commerce para la sección de impresiones de la Tienda del Museo del Prado. Desarrollada como proyecto del curso SSBW.

**Autor**: Jesús Arteaga
**Repositorio**: [GitHub](https://github.com/JesusArSan/PradoPrint)

---

## Qué hace

- Catálogo de 115 productos de impresión scrapeados de tiendaprado.com
- Búsqueda de productos por texto
- Detalle de producto con descripción e imagen
- Carrito de compras con sesión + panel lateral (offcanvas) sin recargar página
- Login y registro con validación UX en tiempo real
- API REST para gestionar productos
- SPA frontend (Vite + React + TypeScript + Tailwind v4) con rutas, portada con DaisyUI, galería aleatoria y carrusel Embla
- Sitio estático Astro SSG con React Island para el carrusel, destacados y páginas de detalle

---

## Requisitos

- Node.js v22+
- Docker

---

## URLs de desarrollo

Para revisión completa:

```bash
make all
```

Este comando despliega la tienda clásica, la SPA Vite y el sitio Astro. Su salida normal es únicamente:

```text
  Paginas disponibles:
    Tienda clásica:     http://localhost:3000
    SPA Vite React:    http://localhost:5173
    Astro SSG:         http://localhost:4321
```

| Servicio | URL | Comando |
|---|---|---|
| Tienda clásica / backend Express | `http://localhost:3000` | `make all` o `make dev` |
| SPA Vite + React | `http://localhost:5173` | `make all` o `make dev` |
| Sitio estático Astro | `http://localhost:4321` | `make all` o `make astro-dev` |

`make dev` sigue disponible si sólo quieres arrancar backend + SPA. `make astro-dev` sigue disponible si sólo quieres revisar Astro.

---

## Cómo arrancarlo

La primera vez, desde cero:
```bash
git clone https://github.com/JesusArSan/PradoPrint.git
cd PradoPrint
make setup
```

`make setup` deja backend + SPA listos en un solo comando:
1. Crea `.env` desde `.env.example` si no existe
2. Instala dependencias
3. Si faltan productos o imágenes, ejecuta el scraper
4. Levanta PostgreSQL en Docker
5. Aplica migraciones
6. Si la BD está vacía, carga los 115 productos y usuarios de prueba
7. Arranca la tienda clásica en `http://localhost:3000` y la SPA en `http://localhost:5173`

Las siguientes veces basta con:
```bash
make all
```

Para parar todo (servidores + base de datos):
```bash
make down
```

---

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@prado.es | admin123 | Admin |
| user@prado.es | clave123 | Usuario |

---

## Funcionalidades destacadas

### Login con mejoras UX

La pantalla de login aplica varios principios de usabilidad:

- **Autofocus** en el campo email al cargar la página
- **Labels clickables** asociados correctamente a cada input
- **Tipos de input especializados** (`email`, `password`) para teclados móviles
- **Placeholders con ejemplos** (ej: `tu@email.com`)
- **Toggle de visibilidad** de contraseña (icono ojo)
- **Validación on blur** — feedback inmediato al salir del campo, no sólo al enviar
- **Requisitos de contraseña en tiempo real** — se muestra una checklist que se marca en verde/rojo conforme el usuario escribe (mínimo 6 caracteres, mayúscula, minúscula, número)
- **Mensajes de error específicos** — explican exactamente qué falla, no un genérico "campo inválido"

Implementado con JavaScript puro y manipulación DOM directa, sin librerías externas. Código en [src/public/js/login-ux.js](src/public/js/login-ux.js).

### Carrito con panel offcanvas

El icono del carrito en la navbar abre un **panel lateral (offcanvas)** con los productos añadidos, sin recargar la página:

- Fetch al endpoint `GET /api/carrito-items` al abrir el panel
- Renderizado dinámico usando `<template>` + `cloneNode(true)` (sin `innerHTML` con strings concatenados)
- Botón para eliminar productos individualmente — el panel se actualiza al instante
- Total visible en el footer del panel
- Enlace a `/carrito` para la vista completa con más opciones

Código en [src/public/js/carrito-offcanvas.js](src/public/js/carrito-offcanvas.js). El template HTML está en [src/views/base.njk](src/views/base.njk).

---

## Estructura
```
PradoPrint/
├── src/
│   ├── index.ts                # Servidor Express
│   ├── routes/
│   │   ├── productos.ts        # Rutas web + endpoint /api/carrito-items
│   │   └── usuarios.ts         # Login, registro, logout
│   ├── apis/
│   │   └── productos.ts        # API REST de productos
│   ├── middleware/
│   │   └── auth.ts             # Verificación JWT
│   ├── config/
│   │   └── logger.ts           # Logger Winston
│   ├── public/
│   │   ├── css/styles.css      # Estilos
│   │   └── js/
│   │       ├── login-ux.js          # Validación UX del login
│   │       └── carrito-offcanvas.js # Carrito offcanvas con <template>
│   └── views/                  # Plantillas Nunjucks
│       ├── base.njk            # Layout + offcanvas + <template>
│       ├── portada.njk
│       ├── detalle.njk
│       ├── carrito.njk
│       ├── login.njk
│       └── registro.njk
├── prisma/
│   ├── schema.prisma           # Modelos de la BD
│   ├── prisma.client.ts        # Cliente Prisma extendido
│   └── migrations/
├── scripts/
│   ├── seed.ts                 # Carga productos en la BD
│   ├── seed-if-empty.ts        # Seed sólo si la BD está vacía
│   ├── registra_usuarios.ts    # Crea usuarios de prueba
│   ├── clean-productos.ts      # Vacía la tabla de productos
│   └── scrap-tp.js             # Scraper Playwright de tiendaprado.com
├── tests/
│   └── test-api.http           # Tests REST Client para la API
├── data/productos.json         # Productos scrapeados
├── imagenes/                   # Imágenes descargadas
├── frontend/                   # SPA Vite + React + TS + Tailwind + Router
│   ├── src/
│   │   ├── App.tsx             # Layout + rutas de React Router
│   │   ├── main.tsx
│   │   ├── index.css           # Tailwind v4 + DaisyUI + tema Montserrat
│   │   ├── lib/
│   │   │   ├── api.ts          # Helper para construir URLs del backend
│   │   │   └── images.ts       # Helper para resolver imágenes de producto
│   │   ├── pages/
│   │   │   ├── HomePage.tsx    # Portada minimalista
│   │   │   ├── Tarea9Page.tsx  # Galería de perro + cuadro aleatorio
│   │   │   └── CarouselPage.tsx # Carrusel Embla con productos
│   │   └── components/
│   │       ├── Card.tsx        # Tarjeta reutilizable para ambos paneles
│   │       ├── Perritos.tsx    # useState + useEffect (API dog.ceo)
│   │       └── Cuadros.tsx     # SWR (API /api/cuadros/random)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── astro/                      # Sitio estático Astro + React Islands
│   ├── astro.config.mjs
│   ├── package.json
│   ├── tsconfig.json
│   ├── public/
│   │   └── imagenes            # Enlace a ../imagenes para servir assets
│   └── src/
│       ├── assets/
│       │   └── app.css         # Tailwind v4 + DaisyUI
│       ├── components/
│       │   ├── CardProducto.astro # Tarjeta para destacados SSG
│       │   ├── Carrousel.tsx   # Isla React con Embla Carousel
│       │   ├── CarrouselSSG.tsx # Adaptador React con productos por props
│       │   └── Welcome.astro   # Portada Astro
│       ├── layouts/
│       │   ├── Layout.astro    # HTML compartido
│       │   └── LayoutPrado.astro # Layout para páginas SSG de tienda
│       ├── lib/
│       │   └── productos.ts    # Slugs e imágenes de productos
│       └── pages/
│           ├── index.astro     # /
│           ├── carrousel.astro # /carrousel
│           ├── ssg.astro       # /ssg, destacados estáticos
│           └── productos/
│               └── [slug].astro # Detalle SSG de cada producto
├── docker-compose.yml          # PostgreSQL en Docker
├── Makefile                    # Comandos del proyecto
├── .env.example                # Plantilla de variables de entorno
└── .env                        # Variables de entorno (auto-creado)
```

---

## Variables de entorno

`make setup` crea el `.env` automáticamente desde `.env.example`. Edítalo si necesitas cambiar las credenciales:

```env
PORT=3000

POSTGRES_USER=pradoprint
POSTGRES_PASSWORD=pradoprint
POSTGRES_DB=pradoprint_ssbw
DATABASE_URL=postgresql://pradoprint:pradoprint@localhost:5432/pradoprint_ssbw?schema=public

SESSION_SECRET=cambiar_esto_en_produccion
SECRET_KEY=cambiar_esto_jwt_secret

# Solo si la SPA y el backend están en dominios distintos (lista separada por comas).
FRONTEND_ORIGIN=
```

---

## Comandos

```bash
# Flujo principal
make all              # Arranca backend + SPA + Astro con salida mínima
make setup            # Primera vez: instala todo y arranca backend + SPA
make dev              # Arranca BD + backend + SPA Vite
make down             # Para servidores de desarrollo + PostgreSQL
make reset            # Borra todo y vuelve a empezar desde cero

# Docker / Base de datos
make db-up            # Arranca PostgreSQL en Docker
make db-down          # Para PostgreSQL
make migrate          # Crea y aplica una migración nueva
make deploy-migrate   # Aplica migraciones existentes
make studio           # Abre Prisma Studio en localhost:5555

# Datos
make scrapper         # Scrapea productos de tiendaprado.com
make seed             # Carga productos en la BD (borra los existentes)
make registra         # Crea usuarios de prueba
make clean-productos  # Vacía la tabla de productos

# Frontend (SPA)
make frontend-install # Instala dependencias del SPA
make frontend-dev     # Arranca Vite en localhost:5173
make frontend-build   # Build de producción del SPA

# Astro
make astro-install    # Instala dependencias del sitio Astro
make astro-dev        # Arranca Astro en localhost:4321
make astro-build      # Build estático de Astro
make astro-preview    # Preview del build de Astro

# Mantenimiento
make build            # Compila TypeScript a dist/
make clean            # Limpia logs/
make full-clean       # Limpia logs/, node_modules/ (backend + frontend)
```

---

## API REST

```
GET    /api/productos?desde=1&hasta=50&ordenación=asc   # Con paginación y ordenación
GET    /api/producto/:id
POST   /api/productos
PUT    /api/producto/:id
DELETE /api/producto/:id

GET    /api/carrito-items      # JSON del carrito (usado por el offcanvas)
GET    /api/cuadros/random     # Devuelve un cuadro aleatorio (consumido por la SPA)
```

Hay ejemplos listos para usar en [tests/test-api.http](tests/test-api.http) con la extensión REST Client de VS Code.

---

## Stack

- **Node.js + TypeScript** — runtime y lenguaje
- **Express 5** — framework web
- **Nunjucks** — plantillas HTML
- **Prisma 7** — ORM para PostgreSQL
- **PostgreSQL** — base de datos (en Docker)
- **JWT + bcrypt** — autenticación
- **Winston** — logs
- **Playwright** — scraping
- **Bootstrap 5** — estilos y componente offcanvas
- **DOM API nativa** — validaciones del login y renderizado del carrito (sin frameworks JS)
- **Vite + React + TypeScript** — SPA frontend (carpeta `frontend/`)
- **React Router** — navegación entre páginas de la SPA
- **Tailwind CSS v4** — estilos del SPA (plugin oficial de Vite)
- **DaisyUI** — componentes de UI en SPA y Astro
- **Embla Carousel** — carrusel de productos en la SPA
- **SWR** — fetching/caché del cuadro aleatorio en el SPA
- **Astro** — sitio estático con React Islands

---

## SPA frontend

La SPA vive en la carpeta `frontend/` y usa React Router para separar tres páginas: portada, galería aleatoria y carrusel de productos. Consume una API externa para la imagen aleatoria de perro y el backend de PradoPrint para cuadros y productos.

### Rutas

- `/` — portada minimalista con accesos a las páginas.
- `/tarea-9` — galería con los dos componentes previos: perro aleatorio y cuadro aleatorio.
- `/carousel` — carrusel Embla con productos servidos por `GET /api/productos`.

### Componentes

- `frontend/src/components/Perritos.tsx` — `useState` + `useEffect`, fetch a `https://dog.ceo/api/breeds/image/random`, gestiona estados `loading` y `error`.
- `frontend/src/components/Cuadros.tsx` — usa `swr` para llamar a `GET /api/cuadros/random` del backend. Botón **¡Otro!** que invoca `mutate()` para revalidar.
- `frontend/src/components/Card.tsx` — tarjeta base común con imagen centrada, metadatos y botón de recarga.
- `frontend/src/lib/api.ts` — helper único para construir URLs absolutas o relativas según el entorno.
- `frontend/src/lib/images.ts` — helper para resolver imágenes locales del catálogo desde `/public/imagenes`.
- `frontend/src/pages/HomePage.tsx` — portada minimalista de la SPA.
- `frontend/src/pages/CarouselPage.tsx` — carrusel con `embla-carousel-react` y productos del backend.

### Stack

- Vite 5 + React 18 + TypeScript
- Tailwind CSS v4 vía `@tailwindcss/vite` (sin `tailwind.config.js`; tema en CSS)
- React Router 7
- DaisyUI 5
- Embla Carousel React 8
- SWR 2

### Instalación y ejecución

```bash
make dev                 # backend http://localhost:3000 + SPA http://localhost:5173
```

Si sólo necesitas arrancar la SPA, usa:

```bash
make frontend-dev        # http://localhost:5173
```

Build de producción:
```bash
make frontend-build      # genera frontend/dist/
```

### Configuración

Variables (ver `frontend/.env.example`):

| Variable | Ámbito | Descripción |
|---|---|---|
| `VITE_API_URL` | build | Origen del backend cuando la SPA y el backend NO comparten dominio. Vacío por defecto: la SPA usa rutas relativas (`/api/...`). |
| `VITE_DEV_PROXY_TARGET` | dev | Backend al que el proxy de Vite reenvía `/api` y `/public`. Por defecto `http://localhost:3000`. |

**Desarrollo** — La SPA hace fetch a rutas relativas (`/api/cuadros/random`, `/public/imagenes/...`). Vite las proxyea al backend, así que en dev no hay petición cross-origin (no preflight, no CORS). Esto evita que un error de CORS rompa el flujo dev.

**Producción** — Dos despliegues posibles:

1. **Mismo dominio** (SPA servida por el mismo backend o por un reverse proxy delante de ambos): dejar `VITE_API_URL` vacío. Las rutas relativas funcionan sin CORS.
2. **Dominios distintos** (ej. `app.example.com` + `api.example.com`): definir `VITE_API_URL=https://api.example.com` en el build de la SPA y `FRONTEND_ORIGIN=https://app.example.com` en el backend. El middleware CORS reflejará el origen permitido.

### Tailwind

Tailwind v4 se importa directamente desde `frontend/src/index.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=EB+Garamond:ital@0;1&display=swap");
@import "tailwindcss";
@plugin "daisyui";

@theme {
  --font-montserrat: "Montserrat", sans-serif;
}
```

El plugin oficial `@tailwindcss/vite` se registra en `frontend/vite.config.ts`. DaisyUI se activa desde CSS con `@plugin "daisyui";`. La fuente `Montserrat` se aplica con la clase `font-montserrat`.

### CORS

Middleware en [src/middleware/cors.ts](src/middleware/cors.ts):

- **Desarrollo**: el proxy de Vite elimina la mayoría de peticiones cross-origin. Si aun así una petición cross-origin llega (p. ej. abrir la SPA con `127.0.0.1` o desde otra herramienta), se permiten `http://localhost:5173` y `http://127.0.0.1:5173` y los orígenes adicionales que aparezcan en `FRONTEND_ORIGIN`.
- **Producción**: solo los orígenes listados en `FRONTEND_ORIGIN` (separados por coma). Si la variable está vacía, **no se permite ningún origen externo** — el backend sigue funcionando para su propio dominio.
- **Preflight (`OPTIONS`)**: se responde `204` cuando el origen está permitido y `403` cuando no, en lugar de dejar pasar la petición silenciosamente.
- **Headers**: se refleja `Access-Control-Request-Headers` en `Access-Control-Allow-Headers` (en vez de una lista fija); `Access-Control-Allow-Credentials: true`; `Access-Control-Max-Age: 600` para reducir preflights.
- **`Vary: Origin`** siempre, para que caches intermedios no mezclen respuestas entre orígenes.
- Nunca se usa `Access-Control-Allow-Origin: *`.

---

## Astro

El sitio Astro vive en `astro/` y está configurado en modo estático. Usa Tailwind CSS v4, DaisyUI y React mediante `@astrojs/react`.

### Rutas

- `/` — portada servida por `Welcome.astro`.
- `/carrousel` — página Astro que importa los 115 productos de `data/productos.json` en build y renderiza el componente React `CarrouselSSG` con `client:load`.
- `/ssg` — índice SSG con 12 productos destacados.
- `/productos/[slug]` — páginas de detalle generadas en build con `getStaticPaths`.

### React Island

`astro/src/pages/carrousel.astro` pasa los productos ya generados a `astro/src/components/CarrouselSSG.tsx`:

```astro
<CarrouselSSG productos={productosJson} client:load />
```

Así Astro genera HTML estático para la página y sólo hidrata el carrusel interactivo en el navegador.

### Static Site Generation

`astro/src/pages/ssg.astro` genera una portada de destacados con los 12 primeros productos de `data/productos.json`. Cada tarjeta usa `CardProducto.astro` y enlaza al detalle del producto.

`astro/src/pages/productos/[slug].astro` implementa `getStaticPaths()` para crear una página estática por cada producto del catálogo. Los slugs se normalizan en `astro/src/lib/productos.ts` y añaden un sufijo numérico para evitar colisiones cuando hay títulos repetidos.

### Instalación y ejecución

```bash
make astro-install
make astro-dev        # http://localhost:4321
make astro-build
make astro-preview
```

Las imágenes se sirven desde `astro/public/imagenes`, que es un enlace simbólico a la carpeta `imagenes/` del proyecto para evitar duplicar archivos.
