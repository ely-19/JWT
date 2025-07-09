const pool = require('../models/db');

const obtenerPostres = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM postres ORDER BY id ASC');
    // Asegurar que cada postre tenga una imagen por defecto si no tiene
    const postresConImagen = result.rows.map(postre => ({
      ...postre,
      imagen: postre.imagen || 'https://placekitten.com/300/200'
    }));
    res.json(postresConImagen);
  } catch (error) {
    console.error('Error obtenerPostres:', error);
    res.status(500).json({ error: '🍓 Error al obtener los postres' });
  }
};

const obtenerPostrePorId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM postres WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '✨ Postre no encontrado' });
    }
    const postre = result.rows[0];
    // Asegurar imagen por defecto
    postre.imagen = postre.imagen || 'https://placekitten.com/300/200';
    res.json(postre);
  } catch (error) {
    console.error('Error obtenerPostrePorId:', error);
    res.status(500).json({ error: '🍰 Error al obtener el postre' });
  }
};


// 🍭 Crear un nuevo postre adorable
const crearPostre = async (req, res) => {
  const { nombre, precio, descripcion, stock, imagen } = req.body;

  if (!nombre || !precio || stock == null || imagen == null) {
  return res.status(400).json({ error: '🌸 Faltan campos obligatorios' });
}

  try {
    const result = await pool.query(
      'INSERT INTO postres (nombre, precio, descripcion, stock,imagen) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, precio, descripcion, stock, imagen]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error crearPostre:', error);
    res.status(500).json({ error: '🍦 Error al crear el postre' });
  }
};

// 🍓 Actualizar un postre con amor
const actualizarPostre = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, descripcion, stock , imagen} = req.body;

  // Validar que al menos uno de los campos venga para actualizar
  if (nombre === undefined && precio === undefined && descripcion === undefined && stock === undefined && imagen === undefined) {
    return res.status(400).json({ error: '🌸 Debe enviar al menos un campo para actualizar' });
  }

  // Obtener el postre actual para actualizar solo los campos que vienen
  try {
    const postreActual = await pool.query('SELECT * FROM postres WHERE id = $1', [id]);
    if (postreActual.rows.length === 0) {
      return res.status(404).json({ error: '✨ Postre no encontrado' });
    }
    const p = postreActual.rows[0];

    const nuevoNombre = nombre ?? p.nombre;
    const nuevoPrecio = precio ?? p.precio;
    const nuevaDescripcion = descripcion ?? p.descripcion;
    const nuevoStock = stock ?? p.stock;
    const nuevaImagen = imagen ?? p.imagen;

    const result = await pool.query(
      'UPDATE postres SET nombre = $1, precio = $2, descripcion = $3, stock = $4 , imagen = $5 WHERE id = $6 RETURNING *',
      [nuevoNombre, nuevoPrecio, nuevaDescripcion, nuevoStock, nuevaImagen,id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizarPostre:', error);
    res.status(500).json({ error: '🍩 Error al actualizar el postre' });
  }
};

// 🍪 Eliminar un postre con delicadeza
const eliminarPostre = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM postres WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '✨ Postre no encontrado' });
    }
    res.json({ mensaje: '🧁 Postre eliminado con éxito' });
  } catch (error) {
    console.error('Error eliminarPostre:', error);
    res.status(500).json({ error: '🍮 Error al eliminar el postre' });
  }
};

module.exports = {
  obtenerPostres,
  obtenerPostrePorId,
  crearPostre,
  actualizarPostre,
  eliminarPostre,
};
