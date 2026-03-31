/**
 * Clase personalizada para errores de aplicación
 * Extiende Error para mejor manejo en middleware de errores
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const throwError = (statusCode: number, message: string) => {
  throw new AppError(statusCode, message);
};
