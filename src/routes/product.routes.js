import express from 'express';

const router = express.Router();

const productos = [
  {
    id: 1,
    nombre: 'Teclado mecánico',
    precio: 45.5,
    categoria: 'periféricos',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Mouse óptico',
    precio: 15.0,
    categoria: 'periféricos',
    activo: true,
  },
  {
    id: 3,
    nombre: 'Monitor 24',
    precio: 189.99,
    categoria: 'monitores',
    activo: true,
  },
  {
    id: 4,
    nombre: 'Silla de escritorio',
    precio: 210.0,
    categoria: 'mobiliario',
    activo: false,
  },
];

const CAMPOS_VALIDOS = ['nombre', 'precio', 'categoria', 'activo'];

function errorDeCampo(campo, valor) {
  if (campo === 'nombre') {
    return typeof valor === 'string' && valor.trim() !== ''
      ? null
      : 'nombre debe ser texto no vacío';
  }
  if (campo === 'precio') {
    return typeof valor === 'number' && Number.isFinite(valor) && valor > 0
      ? null
      : 'precio debe ser un número mayor que 0';
  }
  if (campo === 'categoria') {
    return typeof valor === 'string' && valor.trim() !== ''
      ? null
      : 'categoria debe ser texto no vacío';
  }
  if (campo === 'activo') {
    return typeof valor === 'boolean' ? null : 'activo debe ser true o false';
  }
  return `campo desconocido: "${campo}"`;
}

router.param('id', (req, res, next, valor) => {
  if (!/^\d+$/.test(valor)) {
    return res
      .status(400)
      .json({ error: `id inválido: "${valor}" debe ser un entero positivo` });
  }

  req.idValidado = Number(valor);
  next();
});

router
  .route('/')
  .get((req, res) => {
    let resultado = productos;

    const { categoria, activo, buscar, precioMin, precioMax, pagina, limite } =
      req.query;

    if (categoria !== undefined) {
      resultado = resultado.filter((p) => p.categoria === categoria);
    }

    if (activo !== undefined) {
      if (activo !== 'true' && activo !== 'false') {
        return res.status(400).json({
          error: `activo debe ser "true" o "false", se recibió "${activo}"`,
        });
      }
      resultado = resultado.filter((p) => p.activo === (activo === 'true'));
    }

    if (buscar !== undefined) {
      const texto = buscar.toLowerCase();
      resultado = resultado.filter((p) =>
        p.nombre.toLowerCase().includes(texto),
      );
    }

    if (precioMin !== undefined) {
      const min = Number(precioMin);
      if (Number.isNaN(min))
        return res
          .status(400)
          .json({ error: `precioMin inválido: "${precioMin}"` });
      resultado = resultado.filter((p) => p.precio >= min);
    }
    if (precioMax !== undefined) {
      const max = Number(precioMax);
      if (Number.isNaN(max))
        return res
          .status(400)
          .json({ error: `precioMax inválido: "${precioMax}"` });
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
  })
  .post((req, res) => {
    if (
      typeof req.body !== 'object' ||
      req.body === null ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        error: 'se esperaba un cuerpo JSON con los datos del producto',
      });
    }

    const clavesDesconocidas = Object.keys(req.body).filter(
      (k) => !CAMPOS_VALIDOS.includes(k),
    );

    if (clavesDesconocidas.length > 0) {
      return res.status(400).json({
        error: `campo(s) no reconocido(s): ${clavesDesconocidas.join(', ')}`,
      });
    }

    for (const campo of ['nombre', 'precio', 'categoria']) {
      const error = errorDeCampo(campo, req.body[campo]);
      if (error) return res.status(400).json({ error: `${campo}: ${error}` });
    }

    if (req.body.activo !== undefined) {
      const error = errorDeCampo('activo', req.body.activo);
      if (error) return res.status(400).json({ error: `activo: ${error}` });
    }

    const nuevoId =
      productos.reduce((max, producto) => Math.max(max, producto.id), 0) + 1;
    const nuevoProducto = {
      id: nuevoId,
      nombre: req.body.nombre.trim(),
      precio: req.body.precio,
      categoria: req.body.categoria.trim(),
      activo: req.body.activo ?? true,
    };

    productos.push(nuevoProducto);
    res.status(201).json(nuevoProducto);
  });

router
  .route('/:id')
  .get((req, res) => {
    const producto = productos.find(
      (producto) => producto.id === req.idValidado,
    );

    if (!producto)
      return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(producto);
  })
  .patch((req, res) => {
    const producto = productos.find((p) => p.id === req.idValidado);
    if (!producto)
      return res
        .status(404)
        .json({ error: `No existe un producto con id ${req.idValidado}` });

    if (
      typeof req.body !== 'object' ||
      req.body === null ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        error: 'se esperaba un cuerpo JSON con los campos a modificar',
      });
    }

    const claves = Object.keys(req.body);
    if (claves.length === 0) {
      return res
        .status(400)
        .json({ error: 'no se proporcionó ningún campo para modificar' });
    }

    const clavesDesconocidas = claves.filter(
      (k) => !CAMPOS_VALIDOS.includes(k),
    );
    if (clavesDesconocidas.length > 0) {
      return res.status(400).json({
        error: `campo(s) no reconocido(s): ${clavesDesconocidas.join(', ')}`,
      });
    }

    for (const campo of claves) {
      const error = errorDeCampo(campo, req.body[campo]);
      if (error) return res.status(400).json({ error: `${campo}: ${error}` });
    }

    for (const campo of claves) {
      producto[campo] =
        typeof req.body[campo] === 'string'
          ? req.body[campo].trim()
          : req.body[campo];
    }
    res.json(producto);
  })
  .delete((req, res) => {
    const producto = productos.find((p) => p.id === req.idValidado);
    if (!producto) return res.status(404).json({ error: `No existe un producto con id ${req.idValidado}` });
    producto.activo = false;
    res.status(200).json(producto);
  });

export default router;