import { Router } from 'express';
import { productService } from '../services/ProductService.ts';
import logger from '../config/logger.ts';
const router = Router();
/**
 * GET / — Página de inicio con todos los productos
 */
router.get('/', async (req, res) => {
    try {
        const cards = await productService.getAllProducts(1, 1000, 'desc');
        res.render('portada.njk', { cards });
    }
    catch (error) {
        logger.error(`Error cargando portada: ${error.message}`);
        res.status(500).send(`Error: ${error.message}`);
    }
});
/**
 * GET /producto/:id — Página de detalle de producto
 */
router.get('/producto/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const producto = await productService.getProductById(id);
        res.render('detalle.njk', { producto });
    }
    catch (error) {
        logger.error(`Error cargando detalle: ${error.message}`);
        res.status(error.statusCode || 500).send(`Error: ${error.message}`);
    }
});
/**
 * GET /buscar — Búsqueda de productos
 */
router.get('/buscar', async (req, res) => {
    try {
        const busqueda = String(req.query.busqueda || '');
        const cards = await productService.searchProducts(busqueda);
        logger.debug(`Búsqueda "${busqueda}" → ${cards.length} resultados`);
        res.render('portada.njk', { cards, busqueda });
    }
    catch (error) {
        logger.error(`Error en búsqueda: ${error.message}`);
        res.status(500).send(`Error: ${error.message}`);
    }
});
/**
 * POST /al-carrito/:id — Añadir producto al carrito
 */
router.post('/al-carrito/:id', (req, res) => {
    const id = Number(req.params.id);
    const cantidad = Number(req.body.cantidad);
    logger.debug(`Al carrito: producto ${id}, ${cantidad} unidades`);
    if (cantidad > 0) {
        if (!req.session.carrito) {
            req.session.carrito = [];
        }
        const existente = req.session.carrito.find(item => item.id === id);
        if (existente) {
            existente.cantidad += cantidad;
        }
        else {
            req.session.carrito.push({ id, cantidad });
        }
        const total = req.session.carrito.reduce((acc, item) => acc + item.cantidad, 0);
        req.session.total_carrito = total;
        res.locals.total_carrito = total;
    }
    res.redirect(`/producto/${id}`);
});
/**
 * GET /carrito — Ver carrito
 */
router.get('/carrito', async (req, res) => {
    try {
        const items = req.session.carrito ?? [];
        if (items.length === 0) {
            return res.render('carrito.njk', { lineas: [], total: 0 });
        }
        const lineas = await Promise.all(items.map(async (item) => {
            const producto = await productService.getProductById(item.id);
            return {
                producto,
                cantidad: item.cantidad,
                subtotal: Number(producto.precio) * item.cantidad,
            };
        }));
        const total = lineas.reduce((acc, linea) => acc + linea.subtotal, 0);
        logger.debug(`Carrito: ${lineas.length} líneas, total ${total}€`);
        res.render('carrito.njk', { lineas, total });
    }
    catch (error) {
        logger.error(`Error cargando carrito: ${error.message}`);
        res.status(500).send(`Error: ${error.message}`);
    }
});
/**
 * POST /carrito/eliminar/:id — Eliminar producto del carrito
 */
router.post('/carrito/eliminar/:id', (req, res) => {
    const id = Number(req.params.id);
    if (req.session.carrito) {
        req.session.carrito = req.session.carrito.filter(item => item.id !== id);
        const total = req.session.carrito.reduce((acc, item) => acc + item.cantidad, 0);
        req.session.total_carrito = total;
    }
    res.redirect('/carrito');
});
/**
 * POST /carrito/cantidad/:id — Actualizar cantidad en carrito
 */
router.post('/carrito/cantidad/:id', (req, res) => {
    const id = Number(req.params.id);
    const cantidad = Number(req.body.cantidad);
    if (req.session.carrito) {
        const item = req.session.carrito.find(item => item.id === id);
        if (item) {
            if (cantidad <= 0) {
                req.session.carrito = req.session.carrito.filter(item => item.id !== id);
            }
            else {
                item.cantidad = cantidad;
            }
        }
        const total = req.session.carrito.reduce((acc, item) => acc + item.cantidad, 0);
        req.session.total_carrito = total;
    }
    res.redirect('/carrito');
});
/**
 * POST /carrito/vaciar — Vaciar carrito
 */
router.post('/carrito/vaciar', (req, res) => {
    req.session.carrito = [];
    req.session.total_carrito = 0;
    res.redirect('/carrito');
});
export default router;
