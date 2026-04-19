import fs from 'fs';
import path from 'path';
import prisma from '../prisma/prisma.client';
import logger from '../src/config/logger';
const seedDatabase = async () => {
    try {
        logger.info('Iniciando seed de productos...');
        // Leer productos.json
        const dataPath = path.join(process.cwd(), 'data', 'productos.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const productos = JSON.parse(rawData);
        logger.info(`Encontrados ${productos.length} productos`);
        // Limpiar productos existentes
        await prisma.producto.deleteMany();
        logger.info('Productos anteriores eliminados');
        // Insertar nuevos productos
        for (const producto of productos) {
            // Parsear precio desde texto_precio (ej: "30,00 €" => 30.00)
            const precioStr = producto.texto_precio?.replace(/[^0-9,]/g, '').replace(',', '.') || '0';
            const precio = parseFloat(precioStr);
            await prisma.producto.create({
                data: {
                    título: producto.título,
                    descripción: producto.descripción,
                    precio: precio,
                    imagen: producto.imagen,
                },
            });
        }
        logger.info(`${productos.length} productos insertados correctamente`);
    }
    catch (error) {
        logger.error('Error en seed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
};
// Ejecutar seed
seedDatabase();
