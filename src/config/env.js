/**
 * Centraliza todas las variables de entorno de la aplicación
 * Valida que existan las variables necesarias al iniciar
 */
const requiredEnvVars = ['SECRET_KEY', 'DATABASE_URL'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
    process.exit(1);
}
export const env = {
    // Server
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    // Security
    SECRET_KEY: process.env.SECRET_KEY,
    SESSION_SECRET: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    // Feature flags
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
};
