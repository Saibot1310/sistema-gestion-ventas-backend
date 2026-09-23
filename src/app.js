import express, { json } from 'express';

const app = express();

const productos = [
  { id: 1, nombre: 'Teclado mecánico', precio: 45.5, categoria: 'periféricos', activo: true },
  { id: 2, nombre: 'Mouse óptico', precio: 15.0, categoria: 'periféricos', activo: true },
  { id: 3, nombre: 'Monitor 24', precio: 189.99, categoria: 'monitores', activo: true },
  { id: 4, nombre: 'Silla de escritorio', precio: 210.0, categoria: 'mobiliario', activo: false },
];

app.get('/', (req, res) => {
  res.type('text/plain').send('API del Sistema de Gestión de Ventas\nDiagnóstico: GET /health\n');
});

app.get('/health', (req, res) => {
  res.json({ estado: 'ok' });
});

app.get('/productos', (req, res) => {
  return res.json(productos);
});

app.get('/productos/:id', (req, res) => {

  const id = Number(req.params.id);
  const producto = productos.find(producto => producto.id === id);

  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  res.json(producto);

});

app.post('/productos', (req, res) => {

  res.status(501).json({ error: 'Aún no implementado: crear productos requiere leer el body (Módulo 7)' });
});

app.patch('/products/:id', (req, res) => {
  res.status(501).json({ error: 'Aún no implementado: modificar productos requiere leer el body (Módulo 7)' });
});

app.delete('/productos/:id', (req, res) => {

  const id = Number(req.params.id);

  const producto = productos.find(producto => producto.id === id);

  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  producto.activo = false;

  res.status(200).json(producto);

});

export default app;