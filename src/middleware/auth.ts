import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import logger from '../config/logger.ts';

/**
 * Middleware de autenticación JWT
 * Valida token y popula app.locals con datos del usuario
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      res.locals.usuario = undefined;
      res.locals.admin = false;
      return next();
    }

    const decoded = jwt.verify(token, env.SECRET_KEY) as any;
    res.locals.usuario = decoded.usuario;
    res.locals.admin = decoded.admin || false;

    logger.debug(`Autenticado: ${decoded.usuario} (admin: ${decoded.admin})`);
  } catch (error) {
    logger.warn(`Token JWT inválido o expirado`);
    res.clearCookie('access_token');
    res.locals.usuario = undefined;
    res.locals.admin = false;
  }

  next();
};

/**
 * Middleware para requerir autenticación
 * Devuelve 401 si no hay usuario
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.usuario) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }
  next();
};

/**
 * Middleware para requerir permisos de admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.admin) {
    return res.status(403).json({ error: 'Permisos de administrador requeridos' });
  }
  next();
};
