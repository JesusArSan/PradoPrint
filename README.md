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

# Mantenimiento
make build            # Compila TypeScript a dist/
make clean            # Limpia logs/
make full-clean       # Limpia logs/ y node_modules/
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
