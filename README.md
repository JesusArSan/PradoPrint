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
- SPA frontend (Vite + React + TypeScript + Tailwind v4 + SWR) con dos componentes: imagen aleatoria de perro y cuadro aleatorio del catálogo

---

## Requisitos

- Node.js v22+
- Docker

---

## Cómo arrancarlo

La primera vez, desde cero:
```bash
git clone https://github.com/JesusArSan/PradoPrint.git
cd PradoPrint
make setup
```

`make setup` deja todo listo en un solo comando:
1. Crea `.env` desde `.env.example` si no existe
2. Instala dependencias
3. Si faltan productos o imágenes, ejecuta el scraper
4. Levanta PostgreSQL en Docker
5. Aplica migraciones
6. Si la BD está vacía, carga los 115 productos y usuarios de prueba
7. Arranca el servidor en `http://localhost:3000`

Las siguientes veces basta con:
```bash
make dev
```

Para parar todo (servidor + base de datos):
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
├── frontend/                   # SPA Vite + React + TS + Tailwind + SWR
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css           # Tailwind v4 + tema Montserrat
│   │   └── components/
│   │       ├── Perritos.tsx    # useState + useEffect (API dog.ceo)
│   │       └── Cuadros.tsx     # SWR (API /api/cuadros/random)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
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
make setup            # Primera vez: instala todo y arranca el servidor
make dev              # Arranca BD + migraciones + seed (si vacía) + servidor
make down             # Para servidor + PostgreSQL
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
- **Tailwind CSS v4** — estilos del SPA (plugin oficial de Vite)
- **SWR** — fetching/caché del cuadro aleatorio en el SPA

---

## SPA frontend

La SPA vive en la carpeta `frontend/` y consume tanto una API externa (perros aleatorios) como el backend de PradoPrint (cuadros aleatorios).

### Componentes

- `frontend/src/components/Perritos.tsx` — `useState` + `useEffect`, fetch a `https://dog.ceo/api/breeds/image/random`, gestiona estados `loading` y `error`.
- `frontend/src/components/Cuadros.tsx` — usa `swr` para llamar a `GET /api/cuadros/random` del backend. Botón **¡Otro!** que invoca `mutate()` para revalidar.

### Stack

- Vite 5 + React 18 + TypeScript
- Tailwind CSS v4 vía `@tailwindcss/vite` (sin `tailwind.config.js`; tema en CSS)
- SWR 2

### Instalación y ejecución

```bash
# 1. Backend (terminal 1) — incluye DB, migraciones y seed
make dev                 # http://localhost:3000

# 2. Frontend (terminal 2)
make frontend-dev        # http://localhost:5173 (instala deps si falta)
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

@theme {
  --font-montserrat: "Montserrat", sans-serif;
}
```

El plugin oficial `@tailwindcss/vite` se registra en `frontend/vite.config.ts`. La fuente `Montserrat` se aplica con la clase `font-montserrat`.

### CORS

Middleware en [src/middleware/cors.ts](src/middleware/cors.ts):

- **Desarrollo**: el proxy de Vite elimina la mayoría de peticiones cross-origin. Si aun así una petición cross-origin llega (p. ej. abrir la SPA con `127.0.0.1` o desde otra herramienta), se permiten `http://localhost:5173` y `http://127.0.0.1:5173` y los orígenes adicionales que aparezcan en `FRONTEND_ORIGIN`.
- **Producción**: solo los orígenes listados en `FRONTEND_ORIGIN` (separados por coma). Si la variable está vacía, **no se permite ningún origen externo** — el backend sigue funcionando para su propio dominio.
- **Preflight (`OPTIONS`)**: se responde `204` cuando el origen está permitido y `403` cuando no, en lugar de dejar pasar la petición silenciosamente.
- **Headers**: se refleja `Access-Control-Request-Headers` en `Access-Control-Allow-Headers` (en vez de una lista fija); `Access-Control-Allow-Credentials: true`; `Access-Control-Max-Age: 600` para reducir preflights.
- **`Vary: Origin`** siempre, para que caches intermedios no mezclen respuestas entre orígenes.
- Nunca se usa `Access-Control-Allow-Origin: *`.
