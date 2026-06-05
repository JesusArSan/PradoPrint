import { Router } from 'express';
import { authService } from '../services/AuthService.ts';
import { asyncHandler } from '../middleware/errorHandler.ts';
const router = Router();
/**
 * GET /login — Formulario de login
 */
router.get('/login', (req, res) => {
    res.render('login.njk', { error: false });
});
/**
 * POST /login — Procesar login
 */
router.post('/login', asyncHandler(async (req, res) => {
    const { email, contraseña } = req.body;
    const { usuario, token } = await authService.login({ email, contraseña });
    res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.redirect('/');
}));
/**
 * GET /logout — Cerrar sesión
 */
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('access_token').redirect('/');
    });
});
/**
 * GET /registro — Formulario de registro
 */
router.get('/registro', (req, res) => {
    res.render('registro.njk', { error: false });
});
/**
 * POST /registro — Procesar registro
 */
router.post('/registro', asyncHandler(async (req, res) => {
    const { email, nombre, contraseña } = req.body;
    await authService.register({ email, nombre, contraseña });
    res.redirect('/login');
}));
export default router;
