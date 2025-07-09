-- 🍓 Tabla de usuarias adorables
CREATE TABLE usuarias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL
);

-- 🧁 Tabla de postres deliciosos
CREATE TABLE postres (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    descripcion TEXT,
    stock INTEGER NOT NULL,
    imagen TEXT
);

-- ✨ Ver todas las usuarias y postres
SELECT * FROM usuarias;
SELECT * FROM postres;


DROP TABLE usuarias;
DROP TABLE postres;
