const pool = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrarUsuaria = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ error: '🌸 Faltan campos obligatorios' });
  }
  try {
    const hash = await bcrypt.hash(contraseña, 10);
    const result = await pool.query(
      'INSERT INTO usuarias (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
      [nombre, correo, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error registrarUsuaria:', error.message);
    res.status(500).json({ error: '🍰 Error al registrar a la usuaria' });
  }
};

const loginUsuaria = async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: '🌸 Faltan correo o contraseña' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarias WHERE correo = $1', [correo]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '✨ Credenciales inválidas, revisa tu correo o contraseña' });
    }

    const usuaria = result.rows[0];
    const match = await bcrypt.compare(contraseña, usuaria.contrasena);
    if (!match) {
      return res.status(401).json({ error: '✨ Credenciales inválidas, revisa tu correo o contraseña' });
    }

    const token = jwt.sign(
      { id: usuaria.id, correo: usuaria.correo, nombre: usuaria.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Enviar el nombre en la respuesta
    res.json({ 
      token,
      nombre: usuaria.nombre 
    });
  } catch (error) {
    console.error('Error loginUsuaria:', error);
    res.status(500).json({ error: '🍓 Error al iniciar sesión' });
  }
};
const verificarToken = async (req, res) => {
  
  res.json({ valido: true, usuario: req.usuario });
};

module.exports = {
  registrarUsuaria,
  loginUsuaria,
  verificarToken
};