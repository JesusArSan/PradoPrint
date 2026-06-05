import 'dotenv/config';
import express from 'express';
import nunjucks from 'nunjucks';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import logger from './config/logger';

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { corsMiddleware } from './middleware/cors';

import productosRouter from './routes/productos';
import carritoRouter from './routes/carrito';
import usuariosRouter from './routes/usuarios';
import apiProductosRouter from './apis/productos';
import apiCarritoRouter from './apis/carrito';

const app = express();

nunjucks.configure('src/views', {
  autoescape: true,
  express: app,
  watch: env.isDevelopment,
});
app.set('view engine', 'njk');

app.use(corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: env.isProduction,
      sameSite: 'lax',
      httpOnly: true,
    },
  })
);

// Exponer el contador del carrito en todas las vistas
app.use((req, res, next) => {
  res.locals.total_carrito = req.session?.total_carrito ?? 0;
  next();
});

app.use(authMiddleware);

// Assets estáticos
app.use('/public/imagenes', express.static('imagenes'));
app.use('/css', express.static('src/public/css'));
app.use('/js', express.static('src/public/js'));
app.use(express.static('public'));

// Rutas web
app.use('/', productosRouter);
app.use('/', carritoRouter);
app.use('/', usuariosRouter);

// API REST
app.use('/api', apiProductosRouter);
app.use('/api', apiCarritoRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Servidor arrancado en http://localhost:${env.PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando aplicación...');
  process.exit(0);
});
