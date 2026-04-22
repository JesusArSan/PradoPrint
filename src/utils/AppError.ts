/**
 * Error operacional con código HTTP.
 * Cualquier error lanzado como AppError es tratado por `errorHandler`
 * como una respuesta de error esperada (el mensaje llega al cliente).
 */
export class AppError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
