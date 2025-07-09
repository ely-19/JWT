const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 🍰 Rutas de nuestros dulces y usuarias
const postresRoutes = require('./routes/postres');
const chicasRoutes = require('./routes/usuarias');

const app = express();

// 🩷 Middleware para permitir magia entre dominios
app.use(cors());
app.use(express.json());

// 🌸 Servir archivos bonitos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// 💖 Rutas de la app
app.use('/api/postres', postresRoutes);
app.use('/api/usuarias', chicasRoutes);

const PUERTO_DULCE = process.env.PORT || 3000;

// 🧁 Encendemos el servidor con mucho amor pastelero
app.listen(PUERTO_DULCE, () => {
  console.log(`🍓✨ Servidor corriendo con ternura en el puerto ${PUERTO_DULCE} ✨🍓`);
});
