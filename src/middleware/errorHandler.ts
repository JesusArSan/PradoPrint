import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.ts';
import logger from '../config/logger.ts';

/**
 * Middleware global de errores. Content-negotiation:
 * - Rutas /api/* → JSON
 * - Resto → texto plano (rutas web)
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError;
  const message = isOperational ? err.message : 'Error interno del servidor';
  const isDev = process.env.NODE_ENV === 'development';

  logger.error(`[${req.method} ${req.path}] ${statusCode}: ${err.message}`);

  const wantsJson = req.path.startsWith('/api/') || req.accepts(['html', 'json']) === 'json';

  if (wantsJson) {
    res.status(statusCode).json({
      success: false,
      error: message,
      ...(isDev && !isOperational && { details: err.message, stack: err.stack }),
    });
    return;
  }

  res.status(statusCode).send(`Error: ${message}`);
};

/**
 * Envuelve handlers async para que los errores lleguen a `errorHandler`
 * sin necesidad de try/catch en cada ruta.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
