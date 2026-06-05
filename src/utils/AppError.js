/**
 * Clase personalizada para errores de aplicación
 * Extiende Error para mejor manejo en middleware de errores
 */
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export const throwError = (statusCode, message) => {
    throw new AppError(statusCode, message);
};
