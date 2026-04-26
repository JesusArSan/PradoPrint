import prisma from '../../prisma/prisma.client.ts';
import { AppError } from '../utils/AppError.ts';
import type { CreateProductInput, UpdateProductInput } from '../types/validation.ts';
import logger from '../config/logger.ts';

export class ProductService {
  async getAllProducts(
    desde: number = 1,
    hasta: number = 50,
    ordenacion: 'asc' | 'desc' = 'desc'
  ) {
    const skip = Math.max(0, desde - 1);
    const take = Math.max(1, hasta - desde + 1);

    const productos = await prisma.producto.findMany({
      skip,
      take,
      orderBy: { precio: ordenacion },
    });

    return productos;
  }

  async getProductById(id: number) {
    const producto = await prisma.producto.findUnique({ where: { id } });

    if (!producto) {
      throw new AppError(404, `Producto ${id} no encontrado`);
    }

    return producto;
  }

  async createProduct(data: CreateProductInput) {
    try {
      const producto = await prisma.producto.create({
        data: {
          ...data,
          precio: String(data.precio),
        },
      });

      logger.info(`Producto creado: ${producto.id}`);
      return producto;
    } catch (error: any) {
      throw new AppError(400, `Error al crear producto: ${error.message}`);
    }
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(id: number, data: UpdateProductInput) {
    try {
      const updateData: any = { ...data };
      if (data.precio) {
        updateData.precio = String(data.precio);
      }

      const producto = await prisma.producto.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Producto ${id} actualizado`);
      return producto;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError(404, `Producto ${id} no encontrado`);
      }
      throw new AppError(400, `Error al actualizar: ${error.message}`);
    }
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(id: number) {
    try {
      await prisma.producto.delete({ where: { id } });
      logger.info(`Producto ${id} eliminado`);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError(404, `Producto ${id} no encontrado`);
      }
      throw new AppError(400, `Error al eliminar: ${error.message}`);
    }
  }

  /**
   * Devuelve un producto aleatorio (cuadro)
   */
  async getRandomProduct() {
    const total = await prisma.producto.count();
    if (total === 0) {
      throw new AppError(404, 'No hay productos disponibles');
    }
    const skip = Math.floor(Math.random() * total);
    const [producto] = await prisma.producto.findMany({ skip, take: 1 });
    return producto;
  }

  /**
   * Busca productos por texto
   */
  async searchProducts(busqueda: string) {
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
