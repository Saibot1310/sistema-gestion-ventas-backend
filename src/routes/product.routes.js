import express from 'express';
import {
  listarProductos,
  crearProducto,
  obtenerProducto,
  modificarProducto,
  desactivarProducto,
} from '../controllers/product.controller.js';

const router = express.Router();

router.param('id', (req, res, next, valor) => {
  if (!/^\d+$/.test(valor)) {
    return res
      .status(400)
      .json({ error: `id inválido: "${valor}" debe ser un entero positivo` });
  }

  req.idValidado = Number(valor);
  next();
});

router.route('/').get(listarProductos).post(crearProducto);

router
  .route('/:id')
  .get(obtenerProducto)
  .patch(modificarProducto)
  .delete(desactivarProducto);

export default router;
