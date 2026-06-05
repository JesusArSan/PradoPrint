import { Router } from 'express';
import type { Request, Response } from 'express';
import { cartService } from '../services/CartService.ts';
import { asyncHandler } from '../middleware/errorHandler.ts';

const router = Router();

router.post(
  '/al-carrito/:id',
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const cantidad = Number(req.body.cantidad);

    cartService.addItem(req.session, id, cantidad);
    res.redirect(`/producto/${id}`);
  }
);

router.get(
  '/carrito',
  asyncHandler(async (req: Request, res: Response) => {
    const lineas = await cartService.getLines(req.session);
    const total = cartService.calculateTotal(lineas);
    res.render('carrito.njk', { lineas, total });
  })
);

router.post(
  '/carrito/eliminar/:id',
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    cartService.removeItem(req.session, id);
    res.redirect('/carrito');
  }
);

router.post(
  '/carrito/cantidad/:id',
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const cantidad = Number(req.body.cantidad);
    cartService.updateQuantity(req.session, id, cantidad);
    res.redirect('/carrito');
  }
);

router.post(
  '/carrito/vaciar',
  (req: Request, res: Response) => {
    cartService.clear(req.session);
    res.redirect('/carrito');
  }
);

export default router;
