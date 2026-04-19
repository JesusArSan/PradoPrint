import prisma from '../../prisma/prisma.client.ts';
import { AppError } from '../utils/AppError.ts';
import logger from '../config/logger.ts';
export class ProductService {
    async getAllProducts(desde = 1, hasta = 50, ordenacion = 'desc') {
        const skip = Math.max(0, desde - 1);
        const take = Math.max(1, hasta - desde + 1);
        const productos = await prisma.producto.findMany({
            skip,
            take,
            orderBy: { precio: ordenacion },
        });
        return productos;
    }
    async getProductById(id) {
        const producto = await prisma.producto.findUnique({ where: { id } });
        if (!producto) {
            throw new AppError(404, `Producto ${id} no encontrado`);
        }
        return producto;
    }
    async createProduct(data) {
        try {
            const producto = await prisma.producto.create({
                data: {
                    ...data,
                    precio: String(data.precio),
                },
            });
            logger.info(`Producto creado: ${producto.id}`);
            return producto;
        }
        catch (error) {
            throw new AppError(400, `Error al crear producto: ${error.message}`);
        }
    }
    /**
     * Actualiza un producto existente
     */
    async updateProduct(id, data) {
        try {
            const updateData = { ...data };
            if (data.precio) {
                updateData.precio = String(data.precio);
            }
            const producto = await prisma.producto.update({
                where: { id },
                data: updateData,
            });
            logger.info(`Producto ${id} actualizado`);
            return producto;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new AppError(404, `Producto ${id} no encontrado`);
            }
            throw new AppError(400, `Error al actualizar: ${error.message}`);
        }
    }
    /**
     * Elimina un producto
     */
    async deleteProduct(id) {
        try {
            await prisma.producto.delete({ where: { id } });
            logger.info(`Producto ${id} eliminado`);
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new AppError(404, `Producto ${id} no encontrado`);
            }
            throw new AppError(400, `Error al eliminar: ${error.message}`);
        }
    }
    /**
     * Busca productos por texto
     */
    async searchProducts(busqueda) {
        return prisma.producto.findMany({
            where: {
                OR: [
                    { título: { contains: busqueda, mode: 'insensitive' } },
                    { descripción: { contains: busqueda, mode: 'insensitive' } },
                ],
            },
            omit: { descripción: true },
        });
    }
}
export const productService = new ProductService();
