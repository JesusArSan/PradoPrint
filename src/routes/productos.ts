import { Router } from 'express';
import type { Request, Response } from 'express';
import { productService } from '../services/ProductService.ts';
import { asyncHandler } from '../middleware/errorHandler.ts';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const cards = await productService.getAllProducts(1, 1000, 'desc');
    res.render('portada.njk', { cards });
  })
);

router.get(
  '/buscar',
  asyncHandler(async (req: Request, res: Response) => {
    const busqueda = String(req.query.busqueda ?? '');
    const cards = await productService.searchProducts(busqueda);
    res.render('portada.njk', { cards, busqueda });
  })
);

router.get(
  '/producto/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const producto = await productService.getProductById(id);
    res.render('detalle.njk', { producto });
  })
);

export default router;
