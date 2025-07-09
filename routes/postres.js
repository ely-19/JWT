const express = require('express');
const router = express.Router();
const {
  obtenerPostres,
  obtenerPostrePorId,
  crearPostre,
  actualizarPostre,
  eliminarPostre
} = require('../controllers/postresController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/', obtenerPostres);
router.get('/:id', obtenerPostrePorId);
router.post('/', verificarToken, crearPostre);
router.put('/:id', verificarToken, actualizarPostre);
router.delete('/:id', verificarToken, eliminarPostre);

module.exports = router;
