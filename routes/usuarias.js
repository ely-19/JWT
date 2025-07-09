const express = require('express');
const router = express.Router();
const { 
  registrarUsuaria, 
  loginUsuaria,
  verificarToken
} = require('../controllers/usuariaController');
const verificarTokenMiddleware = require('../middlewares/authMiddleware');

router.post('/register', registrarUsuaria);
router.post('/login', loginUsuaria);
router.get('/verificar-token', verificarTokenMiddleware, verificarToken);

module.exports = router;