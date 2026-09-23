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

app.param('id', (req, res, next, valor) => {
  if (!/^\d+$/.test(valor)) {
    return res.status(400).json({ error: `id inválido: "${valor}" debe ser un entero positivo` });
  }

  req.idValidado = Number(valor);
  next();
})

app.get('/productos', (req, res) => {

  let resultado = productos;

  const { categoria, activo, buscar, precioMin, precioMax, pagina, limite } = req.query;

  if (categoria !== undefined) {
    resultado = resultado.filter((p) => p.categoria === categoria);
  }

  if (activo !== undefined) {
    if (activo !== 'true' && activo !== 'false') {
      return res.status(400).json({ error: `activo debe ser "true" o "false", se recibió "${activo}"` });
    }
    resultado = resultado.filter((p) => p.activo === (activo === 'true'));
  }

  if (buscar !== undefined) {
    const texto = buscar.toLowerCase();
    resultado = resultado.filter((p) => p.nombre.toLowerCase().includes(texto));
  }

  if (precioMin !== undefined) {
    const min = Number(precioMin);
    if (Number.isNaN(min)) return res.status(400).json({ error: `precioMin inválido: "${precioMin}"` });
    resultado = resultado.filter((p) => p.precio >= min);
  }
  if (precioMax !== undefined) {
    const max = Number(precioMax);
    if (Number.isNaN(max)) return res.status(400).json({ error: `precioMax inválido: "${precioMax}"` });
    resultado = resultado.filter((p) => p.precio <= max);
  }

  const total = resultado.length;
  let paginaNum = 1;
  let limiteNum = total || 1;
  if (pagina !== undefined || limite !== undefined) {
    paginaNum = Number(pagina ?? 1);
    limiteNum = Number(limite ?? 10);
    if (!Number.isInteger(paginaNum) || paginaNum < 1) {
      return res.status(400).json({ error: `pagina inválida: "${pagina}"` });
    }
    if (!Number.isInteger(limiteNum) || limiteNum < 1) {
      return res.status(400).json({ error: `limite inválido: "${limite}"` });
    }
    const inicio = (paginaNum - 1) * limiteNum;
    resultado = resultado.slice(inicio, inicio + limiteNum);
  }

  res.json({ total, pagina: paginaNum, limite: limiteNum, datos: resultado });

  return res.json(productos);
});

app.get('/productos/:id', (req, res) => {
  const producto = productos.find(producto => producto.id === req.idValidado);

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
  const producto = productos.find(producto => producto.id === req.idValidado);

  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  producto.activo = false;

  res.status(200).json(producto);

});

export default app;