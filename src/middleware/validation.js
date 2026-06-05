import { AppError } from '../utils/AppError.ts';
/**
 * Middleware para validar datos del request body
 * Usa schemas de Zod
 */
export const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
                throw new AppError(400, `Validación fallida: ${errors.join(', ')}`);
            }
            // Reemplaza body con datos validados
            req.body = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Middleware para validar query parameters
 */
export const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
                throw new AppError(400, `Query inválida: ${errors.join(', ')}`);
            }
            // Guarda datos validados en una propiedad custom ya que req.query es de solo lectura
            req.validatedQuery = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
