import prisma from '../prisma/prisma.client.ts';
import logger from '../src/config/logger.ts';

const limpiarProductos = async () => {
  try {
    logger.info('Borrando todos los productos...');

    const { count } = await prisma.producto.deleteMany();

    logger.info(`${count} productos eliminados`);
  } catch (error) {
    logger.error('Error al limpiar productos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

limpiarProductos();
