import { AppError } from '../utils/AppError.ts';
import logger from '../config/logger.ts';
/**
 * Middleware global para capturar errores
 * Debe ser el último middleware
 */
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';
    logger.error(`[${req.method} ${req.path}] ${statusCode}: ${message}`);
    if (err instanceof AppError) {
        return res.status(statusCode).json({
            success: false,
            error: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }
    // Errores no controlados
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { details: message }),
    });
};
/**
 * Wrapper para funciones async de rutas
 * Captura errores sin try-catch repetido
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
