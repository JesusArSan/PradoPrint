import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * CORS restringido.
 * - Desarrollo: orígenes Vite por defecto (localhost:5173 / 127.0.0.1:5173)
 *   más cualquier valor en FRONTEND_ORIGIN (lista separada por comas).
 * - Producción: solo los orígenes listados en FRONTEND_ORIGIN.
 *
 * Nunca usa `*`. Refleja el origen recibido si está permitido.
 */
const DEV_DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const parseList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const configuredOrigins = parseList(process.env.FRONTEND_ORIGIN);

const allowedOrigins = env.isDevelopment
  ? Array.from(new Set([...DEV_DEFAULT_ORIGINS, ...configuredOrigins]))
  : configuredOrigins;

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const isAllowed = !!origin && allowedOrigins.includes(origin);

  // Vary siempre que la respuesta dependa del Origin
  res.setHeader('Vary', 'Origin');

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin!);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,OPTIONS'
    );
    const requestedHeaders = req.headers['access-control-request-headers'];
    res.setHeader(
      'Access-Control-Allow-Headers',
      typeof requestedHeaders === 'string' && requestedHeaders.length > 0
        ? requestedHeaders
        : 'Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Max-Age', '600');
  }

  if (req.method === 'OPTIONS') {
    // Preflight: 204 si origen permitido, 403 si no.
    res.status(isAllowed ? 204 : 403).end();
    return;
  }

  next();
}
