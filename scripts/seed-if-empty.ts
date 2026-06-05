import { execSync } from 'child_process';
import prisma from '../prisma/prisma.client';
import logger from '../src/config/logger';

/**
 * Ejecuta seed y registra solo si la BD está vacía.
 * Así make dev no destruye datos existentes en cada arranque.
 */
async function main() {
  const count = await prisma.producto.count();
  await prisma.$disconnect();

  if (count > 0) {
    logger.info(`BD ya tiene ${count} productos, saltando seed`);
    return;
  }

  logger.info('BD vacía, ejecutando seed y registra...');
  execSync('npx tsx scripts/seed.ts', { stdio: 'inherit' });
  execSync('npx tsx scripts/registra_usuarios.ts', { stdio: 'inherit' });
}

main();
