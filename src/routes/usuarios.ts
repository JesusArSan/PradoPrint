import { Router } from 'express';
import type { Request, Response } from 'express';
import { authService } from '../services/AuthService.ts';
import { asyncHandler } from '../middleware/errorHandler.ts';
import logger from '../config/logger.ts';
import type { LoginUserInput, RegisterUserInput } from '../types/validation.ts';

const router = Router();

/**
 * GET /login — Formulario de login
 */
router.get('/login', (req: Request, res: Response) => {
  res.render('login.njk', { error: false });
});

/**
 * POST /login — Procesar login
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, contraseña } = req.body as LoginUserInput;

    const { usuario, token } = await authService.login({ email, contraseña });

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.redirect('/');
  })
);

/**
 * GET /logout — Cerrar sesión
 */
router.get('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie('access_token').redirect('/');
  });
});

/**
 * GET /registro — Formulario de registro
 */
router.get('/registro', (req: Request, res: Response) => {
  res.render('registro.njk', { error: false });
});

/**
 * POST /registro — Procesar registro
 */
router.post(
  '/registro',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, nombre, contraseña } = req.body as RegisterUserInput;

    await authService.register({ email, nombre, contraseña });

    res.redirect('/login');
  })
);

export default router;
