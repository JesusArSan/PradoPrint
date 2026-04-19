# Makefile para Tienda Prado
# Órdenes frecuentes de desarrollo

# Marcar targets como "phony" (no son archivos reales)
.PHONY: help dev build start seed registra studio migrate generate clean clean-productos install test db-up db-down deploy-migrate setup reset full-clean watch scrapper

# Por defecto mostrar ayuda
.DEFAULT_GOAL := help

# Mensajes de bienvenida
help:
	@echo "TIENDA PRADO - Comandos disponibles:"
	@echo ""
	@echo "Desarrollo:"
	@echo "  make dev              → Servidor con hot-reload (localhost:3000)"
	@echo "  make build            → Compilar TypeScript a dist/"
	@echo "  make start            → Ejecutar versión compilada"
	@echo ""
	@echo "Docker:"
	@echo "  make db-up            → Arranca PostgreSQL en Docker"
	@echo "  make db-down          → Para PostgreSQL"
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
	@echo "Despliegue:"
	@echo "  make setup            → Setup completo desde cero en un equipo nuevo"
	@echo "  make reset            → Borra todo y empieza de nuevo"
	@echo ""
	@echo "Mantenimiento:"
	@echo "  make install          → Instalar dependencias"
	@echo "  make clean            → Limpiar logs/"
	@echo "  make full-clean       → Limpiar logs/ y node_modules/"
	@echo "  make help             → Mostrar este mensaje"
	@echo ""


# Desarrollo

dev: db-up
	npm run dev

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

# Setup completo desde cero en un equipo nuevo:
# 1. Instala dependencias
# 2. Arranca Docker con PostgreSQL
# 3. Aplica migraciones
# 4. Mete los productos
# 5. Crea usuarios de prueba
setup: install db-up deploy-migrate seed registra
	@echo "Tienda Prado lista en http://localhost:3000"

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

full-clean: clean
	@rm -rf node_modules package-lock.json
	@echo "node_modules y package-lock.json eliminados"

test:
	npm test