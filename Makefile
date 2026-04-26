# Makefile para Tienda Prado
# Órdenes frecuentes de desarrollo

# Marcar targets como "phony" (no son archivos reales)
.PHONY: help dev dev-backend dev-frontend build start seed seed-if-empty registra studio migrate generate clean clean-productos install test db-up db-down down deploy-migrate setup reset full-clean watch scrapper scrapper-if-missing check-env frontend-install frontend-dev frontend-build front-clean

# Por defecto mostrar ayuda
.DEFAULT_GOAL := help

# Mensajes de bienvenida
help:
	@echo "TIENDA PRADO - Comandos disponibles:"
	@echo ""
	@echo "Desarrollo:"
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

dev: check-env scrapper-if-missing db-up deploy-migrate seed-if-empty frontend-install
	@echo "Arrancando backend (3000) + frontend (5173)... (Ctrl+C para parar)"
	@$(MAKE) -j2 --no-print-directory dev-backend dev-frontend

dev-backend:
	@npm run dev

dev-frontend:
	@cd frontend && npm run dev

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
	@npx tsx --env-file=.env scripts/seed-if-empty.ts

build:
	npm run build

start:
	npm run start

watch: dev


# Docker

# Arranca la base de datos en Docker
db-up:
	docker compose up -d
	@echo "Esperando a que PostgreSQL arranque..."
	@sleep 3

# Para la base de datos
db-down:
	docker compose down

# Para todo: servidor Node + base de datos
down:
	@-pkill -f "node.*src/index" 2>/dev/null; true
	@-pkill -f "tsx.*src/index" 2>/dev/null; true
	@-pkill -f "vite" 2>/dev/null; true
	@echo "Servidor Node y Vite parados"
	@docker compose down
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
	npx prisma migrate deploy
	npx prisma generate

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

full-clean: clean front-clean
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