# Tienda Prado — Impresiones

Aplicación web de e-commerce para la sección de impresiones de la Tienda del Museo del Prado. Desarrollada como proyecto del curso SSBW.

**Autor**: Jesús Arteaga  
**Repositorio**: [GitHub](https://github.com/JesusArSan/PradoPrint)

---

## Qué hace

- Muestra un catálogo de 115 productos de impresión scrapeados de tiendaprado.com
- Permite buscar productos por texto
- Carrito de compras con sesión y panel lateral offcanvas (sin recargar página)
- Sistema de login y registro con validación UX en tiempo real
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

Esto instala dependencias, arranca PostgreSQL en Docker, aplica las migraciones, carga los productos y usuarios de prueba, y arranca el servidor en `http://localhost:3000`.

Las siguientes veces, basta con:
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

## Estructura
```
PradoPrint/
├── src/
│   ├── index.ts              # Servidor principal
│   ├── routes/
│   │   ├── productos.ts      # Rutas web
│   │   └── usuarios.ts       # Login, registro, logout
│   ├── apis/
│   │   └── productos.ts      # API REST
│   ├── middleware/
│   │   └── auth.ts           # Verificación JWT
│   ├── config/
│   │   └── logger.ts         # Logger Winston
│   ├── public/
│   │   ├── css/styles.css    # Estilos personalizados
│   │   └── js/
│   │       ├── login-ux.js       # Validación UX del login
│   │       └── carrito-offcanvas.js  # Carrito offcanvas con template DOM
│   └── views/                # Plantillas Nunjucks
│       ├── base.njk
│       ├── portada.njk
│       ├── detalle.njk
│       ├── carrito.njk
│       ├── login.njk
│       └── registro.njk
├── prisma/
│   ├── schema.prisma         # Modelos de la BD
│   ├── prisma.client.ts      # Cliente extendido
│   └── migrations/
├── scripts/
│   ├── seed.ts               # Carga productos en la BD
│   ├── registra_usuarios.ts  # Crea usuarios de prueba
│   └── scrap-tp.js           # Scraper de tiendaprado.com
├── data/
│   └── productos.json        # Los 115 productos scrapeados
├── imagenes/                 # Imágenes descargadas
├── docker-compose.yml        # PostgreSQL en Docker
├── Makefile                  # Comandos del proyecto
└── .env                      # Variables de entorno
```

---

## Variables de entorno

`make setup` crea el `.env` automáticamente desde `.env.example`. Puedes editarlo si necesitas cambiar las credenciales:
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
make setup            # Primera vez: instala todo y arranca el servidor
make dev              # Arranca BD + migraciones + seed (si vacía) + servidor
make down             # Para servidor + PostgreSQL
make reset            # Borra todo y vuelve a empezar desde cero

make db-up            # Arrancar PostgreSQL en Docker
make db-down          # Parar PostgreSQL
make scrapper         # Scrapear productos de tiendaprado.com
make seed             # Cargar productos en la BD (borra los existentes)
make registra         # Crear usuarios de prueba
make studio           # Abrir Prisma Studio en localhost:5555
make migrate          # Crear y aplicar una migración nueva
make deploy-migrate   # Aplicar migraciones existentes
make clean            # Limpiar logs
```

---

## API REST
```
GET    /api/productos?desde=1&hasta=50&ordenación=asc
GET    /api/producto/:id
POST   /api/productos
PUT    /api/producto/:id
DELETE /api/producto/:id
```

Hay ejemplos listos para usar en `tests/test-api.http` con la extensión REST Client de VS Code.

---

## Stack

- **Node.js + TypeScript** — runtime y lenguaje
- **Express 5** — framework web
- **Nunjucks** — plantillas HTML
- **Prisma 7** — ORM para PostgreSQL
- **PostgreSQL** — base de datos, en Docker
- **JWT + bcrypt** — autenticación
- **Winston** — logs
- **Playwright** — scraping
- **Bootstrap 5** — estilos