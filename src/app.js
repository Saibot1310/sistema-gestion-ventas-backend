import { randomUUID } from 'node:crypto';
import express from 'express';
import productRoutes from './routes/product.routes.js';

const app = express();

function asignarIdDePeticion(req, res, next) {
  req.id = randomUUID();
  res.set('X-Request-Id', req.id);
  next();
}

function registrarSolicitud(req, res, next) {
  const inicio = process.hrtime.bigint();
  console.log(`[${req.id}] → ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
    console.log(`[${req.id}] ← ${res.statusCode} (${ms.toFixed(1)}ms)`);
  });
  next();
}

app.use(asignarIdDePeticion);
app.use(registrarSolicitud);
app.use(express.json({ limit: '50kb' }));

class ErrorDeAplicacion extends Error {
  constructor(mensaje, status = 500) {
    super(mensaje);
    this.name = 'ErrorDeAplicacion';
    this.status = status;
  }
}

app.get('/', (req, res) => {
  res.type('text/plain').send('API del Sistema de Gestión de Ventas\nDiagnóstico: GET /health\n');
});

app.get('/health', (req, res) => {
  res.json({ estado: 'ok' });
});

app.use('/products', productRoutes);

app.use((req, res, next) => {
  next(new ErrorDeAplicacion(`No se encontró ${req.method} ${req.originalUrl}`, 404));
});

app.use((err, req, res, next) => {
  console.error(`[${req.id ?? 'sin-id'}] error no resuelto por una ruta:`, err);

  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  const esErrorDeCliente = status >= 400 && status < 500;

  const cuerpo = { error: esErrorDeCliente ? err.message : 'Error interno del servidor' };

  if (process.env.NODE_ENV !== 'production') {
    cuerpo.detalle = err.stack;
  }

  res.status(status).json(cuerpo);
});

export default app;