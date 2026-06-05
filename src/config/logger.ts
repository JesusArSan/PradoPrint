import winston from 'winston';
import { mkdir } from 'fs/promises';
import { env } from './env.ts';

const { combine, timestamp, printf, colorize, align, json } = winston.format;

// Crear carpeta logs si no existe
await mkdir('./logs', { recursive: true });

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports: [
    // Consola: todos los niveles con colores y formato legible
    new winston.transports.Console({
      level: env.isDevelopment ? 'debug' : 'info',
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
      ),
    }),

    // Archivo info.log: info y superiores en JSON
    new winston.transports.File({
      filename: './logs/info.log',
      level: 'info',
      format: combine(timestamp(), json()),
    }),

    // Archivo error.log: solo errores en JSON
    new winston.transports.File({
      filename: './logs/error.log',
      level: 'error',
      format: combine(timestamp(), json()),
    }),
  ],
});

export default logger;
