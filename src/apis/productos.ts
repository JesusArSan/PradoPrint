import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { productService } from '../services/ProductService.ts';
import { asyncHandler } from '../middleware/errorHandler.ts';
import { validateBody, validateQuery } from '../middleware/validation.ts';
import { CreateProductSchema, UpdateProductSchema } from '../types/validation.ts';

const router = Router();

// Schema para query params de GET /productos
const QuerySchema = z.object({
  desde: z.coerce.number().int().min(1).default(1),
  hasta: z.coerce.number().int().min(1).default(50),
  ordenación: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/productos?desde=1&hasta=20&ordenación=ascendente
 * Obtiene productos con paginación y ordenación
 */
router.get(
  '/productos',
  validateQuery(QuerySchema),
  asyncHandler(async (req, res) => {
    const { desde, hasta, ordenación } = (req as any).validatedQuery;
    const productos = await productService.getAllProducts(desde, hasta, ordenación);

    res.json({
      success: true,
      data: productos,
      pagination: { desde, hasta, count: productos.length },
    });
  })
);

/**
 * GET /api/cuadros/random
 * Devuelve un producto (cuadro) aleatorio
 */
router.get(
  '/cuadros/random',
  asyncHandler(async (_req, res) => {
    const producto = await productService.getRandomProduct();
    res.json({ success: true, data: producto });
  })
);

/**
 * GET /api/producto/:id
 * Obtiene un producto por ID
 */
router.get(
  '/producto/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const producto = await productService.getProductById(id);

    res.json({ success: true, data: producto });
  })
);

/**
 * POST /api/productos
 * Crea un nuevo producto
 */
router.post(
  '/productos',
  validateBody(CreateProductSchema),
  asyncHandler(async (req, res) => {
    const producto = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: producto,
      message: 'Producto creado exitosamente',
    });
  })
);

/**
 * PUT /api/producto/:id
 * Actualiza un producto existente
 */
router.put(
  '/producto/:id',
  validateBody(UpdateProductSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const producto = await productService.updateProduct(id, req.body);

    res.json({
      success: true,
      data: producto,
      message: 'Producto actualizado exitosamente',
    });
  })
);

/**
 * DELETE /api/producto/:id
 * Elimina un producto
 */
router.delete(
  '/producto/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await productService.deleteProduct(id);

    res.status(204).send();
  })
);

export default router;
