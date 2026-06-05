import { Router } from 'express';
import type { Request, Response } from 'express';
import { cartService } from '../services/CartService.ts';
import { asyncHandler } from '../middleware/errorHandler.ts';

const router = Router();

/**
 * Devuelve el carrito serializado para el panel offcanvas.
 * El campo `producto` se aplana a lo mínimo que necesita la UI.
 */
router.get(
  '/carrito-items',
  asyncHandler(async (req: Request, res: Response) => {
    const lineas = await cartService.getLines(req.session);
    const total = cartService.calculateTotal(lineas);

    const data = lineas.map((linea) => ({
      id: linea.producto.id,
      producto: {
        id: linea.producto.id,
        título: linea.producto.título,
        imagen: linea.producto.imagen,
        precio: linea.producto.precio,
      },
      cantidad: linea.cantidad,
      subtotal: linea.subtotal,
    }));

    res.json({
      success: true,
      data,
      total,
      count: data.length,
    });
  })
);

export default router;
