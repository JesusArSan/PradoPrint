# Makefile para Tienda Prado
# Órdenes frecuentes de desarrollo

SHELL := /bin/bash
.SHELLFLAGS := -c

# Marcar targets como "phony" (no son archivos reales)
.PHONY: help all dev dev-backend dev-frontend build start seed seed-if-empty registra studio migrate generate clean clean-productos install test db-up db-down down deploy-migrate setup reset full-clean watch scrapper scrapper-if-missing check-env frontend-install frontend-dev frontend-build front-clean astro-install astro-dev astro-build astro-preview astro-clean

# Por defecto mostrar ayuda
.DEFAULT_GOAL := help

# Mensajes de bienvenida
help:
	@echo "TIENDA PRADO - Comandos disponibles:"
	@echo ""
	@echo "Desarrollo:"
	@echo "  make all              → Backend + SPA + Astro (salida mínima)"
	@echo "  make dev              → Backend (3000) + SPA (5173) en paralelo"
	@echo "  make build            → Compilar TypeScript a dist/"
	@echo "  make start            → Ejecutar versión compilada"
	@echo ""
	@echo "Docker:"
	@echo "  make db-up            → Arranca PostgreSQL en Docker"
	@echo "  make db-down          → Para PostgreSQL"
	@echo "  make down             → Para servidor + PostgreSQL"
	@echo ""
	@echo "Base de Datos:"
	@echo "  make deploy-migrate   → Aplica migraciones sin crear nuevas"
	@echo "  make migrate          → Crear y aplicar nuevas migraciones"
	@echo "  make generate         → Regenerar tipos de Prisma"
	@echo "  make scrapper         → Scrapear productos de tiendaprado.com"
	@echo "  make seed             → Poblar BD con 115 productos"
	@echo "  make registra         → Crear usuarios test"
	@echo "  make clean-productos  → Vaciar todos los productos de la BD"
	@echo "  make studio           → Abrir Prisma Studio (localhost:5555)"
	@echo ""
	@echo "Frontend (SPA):"
	@echo "  make frontend-install → Instalar dependencias de la SPA"
	@echo "  make frontend-dev     → Arrancar SPA en localhost:5173 (Vite)"
	@echo "  make frontend-build   → Build de producción de la SPA"
	@echo ""
	@echo "Astro:"
	@echo "  make astro-install    → Instalar dependencias del sitio Astro"
	@echo "  make astro-dev        → Arrancar Astro en localhost:4321"
	@echo "  make astro-build      → Build estático de Astro"
	@echo "  make astro-preview    → Preview del build de Astro"
	@echo ""
	@echo "Despliegue:"
	@echo "  make setup            → Primera vez: instala todo y arranca"
	@echo "  make reset            → Borra todo y empieza de nuevo"
	@echo ""
	@echo "Mantenimiento:"
	@echo "  make install          → Instalar dependencias"
	@echo "  make clean            → Limpiar logs/"
	@echo "  make full-clean       → Limpiar logs/ y node_modules/"
	@echo "  make help             → Mostrar este mensaje"
	@echo ""


# Desarrollo

all:
	@if [ ! -f .env ]; then \
		echo "Error: falta el archivo .env. Ejecuta 'make setup' o copia .env.example a .env" >&2; \
		exit 1; \
	fi
	@if fuser -n tcp 3000 5173 4321 >/dev/null 2>&1; then \
		echo "Error: algun puerto requerido ya esta ocupado (3000, 5173 o 4321)" >&2; \
		exit 1; \
	fi; true
	@if [ ! -d frontend/node_modules ]; then \
		echo "[1/7] Instalando dependencias del frontend..."; \
		cd frontend && npm install >/tmp/pradoprint-frontend-install.log 2>&1; \
	fi; true
	@if [ ! -d astro/node_modules ]; then \
		echo "[1/7] Instalando dependencias de Astro..."; \
		cd astro && npm install >/tmp/pradoprint-astro-install.log 2>&1; \
	fi; true
	@echo "[1/7] Arrancando base de datos..."
	@docker compose up -d >/tmp/pradoprint-docker.log 2>&1
	@echo "[2/7] Esperando a PostgreSQL..."
	@until docker compose exec -T db pg_isready >/dev/null 2>&1; do sleep 1; done
	@echo "[3/7] Aplicando migraciones..."
	@script -q -e -c "npx prisma migrate deploy" /tmp/pradoprint-prisma-migrate.log >/dev/null
	@echo "[4/7] Generando Prisma Client..."
	@script -q -e -c "npx prisma generate" /tmp/pradoprint-prisma-generate.log >/dev/null
	@echo "[5/7] Comprobando datos iniciales..."
	@script -q -e -c "npx tsx --env-file=.env scripts/seed-if-empty.ts" /tmp/pradoprint-seed.log >/dev/null
	@echo "[6/7] Lanzando servidores..."
	@trap 'kill $$BACKEND_PID $$FRONTEND_PID $$ASTRO_PID 2>/dev/null; wait $$BACKEND_PID $$FRONTEND_PID $$ASTRO_PID 2>/dev/null; exit 0' INT TERM; \
	npm run --silent dev >/tmp/pradoprint-backend.log 2>&1 & BACKEND_PID=$$!; \
	(cd frontend && npm run --silent dev -- --strictPort >/tmp/pradoprint-frontend.log 2>&1) & FRONTEND_PID=$$!; \
	(cd astro && npm run --silent dev -- --port 4321 >/tmp/pradoprint-astro.log 2>&1) & ASTRO_PID=$$!; \
	sleep 4; \
	if ! kill -0 $$BACKEND_PID $$FRONTEND_PID $$ASTRO_PID 2>/dev/null; then \
		echo "Error: no se pudieron arrancar todos los servidores. Revisa /tmp/pradoprint-*.log" >&2; \
		kill $$BACKEND_PID $$FRONTEND_PID $$ASTRO_PID 2>/dev/null; \
		wait $$BACKEND_PID $$FRONTEND_PID $$ASTRO_PID 2>/dev/null; \
		exit 1; \
	fi; \
	echo "[7/7] Todo listo. Ctrl+C para parar."; \
	echo ""; \
	echo "  Paginas disponibles:"; \
	echo "    Tienda clasica:    http://localhost:3000"; \
	echo "    SPA Vite React:   http://localhost:5173"; \
	echo "    Astro SSG:        http://localhost:4321"; \
	wait $$BACKEND_PID $$FRONTEND_PID $$ASTRO_PID

dev: check-env scrapper-if-missing db-up deploy-migrate seed-if-empty frontend-install
	@echo ""
	@echo "Arrancando backend (3000) + frontend (5173)... (Ctrl+C para parar)"
	@trap 'kill $$BACKEND_PID $$FRONTEND_PID 2>/dev/null; wait $$BACKEND_PID $$FRONTEND_PID 2>/dev/null; exit 0' INT TERM; \
	$(MAKE) --no-print-directory dev-backend & BACKEND_PID=$$!; \
	$(MAKE) --no-print-directory dev-frontend & FRONTEND_PID=$$!; \
	sleep 3; \
	echo ""; \
	echo "Servidores desplegados correctamente"; \
	echo ""; \
	echo "Paginas disponibles:"; \
	echo "  Backend / tienda clásica: http://localhost:3000"; \
	echo "  SPA Vite React:          http://localhost:5173"; \
	echo "  Astro estático:          http://localhost:4321  (arrancar aparte con 'make astro-dev')"; \
	echo ""; \
	wait $$BACKEND_PID $$FRONTEND_PID

dev-backend:
	@npm run --silent dev

dev-frontend:
	@cd frontend && npm run --silent dev

# Scraper solo si faltan datos/productos.json o imagenes/
scrapper-if-missing:
	@if [ ! -f data/productos.json ] || [ ! -d imagenes ] || [ -z "$$(ls -A imagenes 2>/dev/null)" ]; then \
		echo "Faltan productos o imágenes, ejecutando scraper..."; \
		npx playwright install chromium; \
		node scripts/scrap-tp.js; \
	else \
		echo "Productos e imágenes ya existen, saltando scraper"; \
	fi

# Seed solo si la BD está vacía (no destruye datos existentes)
seed-if-empty:
	@script -q -e -c "npx tsx --env-file=.env scripts/seed-if-empty.ts" /tmp/pradoprint-seed.log >/dev/null
	@echo "Datos iniciales comprobados"

build:
	npm run build

start:
	npm run start

watch: dev


# Docker

# Arranca la base de datos en Docker
db-up:
	@docker compose up -d >/dev/null
	@until docker compose exec -T db pg_isready >/dev/null 2>&1; do sleep 1; done
	@echo "Base de datos disponible en localhost:5432"

# Para la base de datos
db-down:
	docker compose down

# Para todo: servidores de desarrollo + base de datos
down:
	@-pkill -f "node.*src/index" 2>/dev/null; true
	@-pkill -f "tsx.*src/index" 2>/dev/null; true
	@-pkill -f "vite" 2>/dev/null; true
	@-pkill -f "astro dev" 2>/dev/null; true
	@docker compose down >/dev/null
	@echo "Servidores de desarrollo parados"
	@echo "Base de datos parada"
	@echo "Todo parado"


# Base de Datos

seed:
	npm run seed

registra:
	npm run registra

clean-productos:
	npx tsx scripts/clean-productos.ts

# Ejecuta el scraper para descargar productos e imágenes de tiendaprado.com
scrapper:
	node scripts/scrap-tp.js

studio:
	npx prisma studio

# Aplica las migraciones existentes sin crear nuevas (para despliegue)
deploy-migrate:
	@script -q -e -c "npx prisma migrate deploy" /tmp/pradoprint-prisma-migrate.log >/dev/null
	@script -q -e -c "npx prisma generate" /tmp/pradoprint-prisma-generate.log >/dev/null
	@echo "Migraciones aplicadas y Prisma Client generado"

# Crea y aplica nuevas migraciones (para desarrollo)
migrate:
	npx prisma migrate dev

generate:
	npx prisma generate


# Despliegue

# Setup completo desde cero: copia .env si falta, instala y arranca todo
setup:
	@test -f .env || (cp .env.example .env && echo "Archivo .env creado desde .env.example — edítalo si necesitas cambiar credenciales")
	$(MAKE) install dev

# Verificar que .env existe antes de cualquier operación que lo necesite
check-env:
	@test -f .env || (echo "Error: falta el archivo .env. Ejecuta 'make setup' o copia .env.example a .env" && exit 1)

# Reset completo: borra todo y vuelve a empezar
reset: full-clean db-down
	docker volume rm pradoprint_postgres_data 2>/dev/null || true
	$(MAKE) setup


# Mantenimiento

install:
	npm install

clean:
	@rm -rf logs/*.log logs/*.json 2>/dev/null || true
	@echo "Logs limpios"

full-clean: clean front-clean astro-clean
	@rm -rf node_modules package-lock.json
	@echo "node_modules y package-lock.json eliminados"

test:
	npm test


# Frontend (SPA Vite + React + TS + Tailwind + SWR)

# Instala dependencias del frontend solo si falta node_modules
frontend-install:
	@if [ ! -d frontend/node_modules ]; then \
		echo "Instalando dependencias del frontend..."; \
		cd frontend && npm install; \
	else \
		echo "Dependencias del frontend ya instaladas"; \
	fi

frontend-dev: frontend-install
	cd frontend && npm run dev

frontend-build: frontend-install
	cd frontend && npm run build

front-clean:
	@rm -rf frontend/node_modules frontend/dist
	@echo "Frontend limpio"


# Astro (sitio estático + React Islands)

astro-install:
	@if [ ! -d astro/node_modules ]; then \
		echo "Instalando dependencias de Astro..."; \
		cd astro && npm install; \
	else \
		echo "Dependencias de Astro ya instaladas"; \
	fi

astro-dev: astro-install
	cd astro && npm run dev

astro-build: astro-install
	cd astro && npm run build

astro-preview: astro-install
	cd astro && npm run preview

astro-clean:
	@rm -rf astro/node_modules astro/dist astro/.astro
	@echo "Astro limpio"
