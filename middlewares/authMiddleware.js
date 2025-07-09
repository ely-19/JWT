const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '🔒 Acceso denegado, token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el token tenga la estructura esperada
    if (!decoded.id || !decoded.correo || !decoded.nombre) {
      return res.status(403).json({ error: '🔐 Token inválido - estructura incorrecta' });
    }
    
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: '🔐 Token inválido o expirado' });
  }
};

module.exports = verificarToken;