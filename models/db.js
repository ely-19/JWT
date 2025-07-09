const { Pool } = require('pg');
require('dotenv').config();

// 🌸 Configuración tierna para conectarnos a nuestra base de datos de postres 🍰
const pool = new Pool({
  user: process.env.DB_USER,        // 👩‍🍳 Usuario de la base
  host: process.env.DB_HOST,        // 🏠 Dónde vive la base
  database: process.env.DB_DATABASE, // 🍓 Nombre dulce de la base
  password: process.env.DB_PASSWORD, // 🔑 Clave secreta
  port: process.env.DB_PORT          // 🚪 Puerto de entrada
});

module.exports = pool;
