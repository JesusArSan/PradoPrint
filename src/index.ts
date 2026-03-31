import 'dotenv/config';
import express from 'express';
import nunjucks from 'nunjucks';
import session from 'express-session';
import cookieParser from 'cookie-parser';

// Config y logger
import { env } from './config/env.ts';
import logger from './config/logger.ts';

// Middleware
import { authMiddleware } from './middleware/auth.ts';
import { errorHandler } from './middleware/errorHandler.ts';

// Rutas
import productosRouter from './routes/productos.ts';
import usuariosRouter from './routes/usuarios.ts';
import apiProductosRouter from './apis/productos.ts';

const app = express();

// ============== CONFIGURACIÓN ==============

// Motor de plantillas Nunjucks
nunjucks.configure('src/views', {
  autoescape: true,
  express: app,
  watch: env.isDevelopment,
});

app.set('view engine', 'njk');

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sessions
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.isProduction,
      sameSite: 'strict', 
      httpOnly: true,
    },
  })
);

// ============== MIDDLEWARE GLOBAL ==============

// Carrito en locals
app.use((req, res, next) => {
  res.locals.total_carrito = req.session?.total_carrito ?? 0;
  next();
});

// Autenticación JWT
app.use(authMiddleware);

// Assets estáticos
app.use('/public/imagenes', express.static('imagenes'));
app.use('/css', express.static('src/public/css'));
app.use(express.static('public'));

// ============== RUTAS ==============

// Rutas web
app.use('/', productosRouter);
app.use('/', usuariosRouter);

// API REST
app.use('/api', apiProductosRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============== MANEJO DE ERRORES ==============

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler (debe ser el último middleware)
app.use(errorHandler);

// ============== INICIAR SERVIDOR ==============

app.listen(env.PORT, () => {
  logger.info(`Servidor arrancado en http://localhost:${env.PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando aplicación...');
  process.exit(0);
});
