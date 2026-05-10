
-- ARRIENDOS360 - Script DDL
-- Base de datos: PostgreSQL
-- Fecha: Mayo 2026

-- Tabla USUARIOS
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    correo VARCHAR(150) UNIQUE NOT NULL,
    hash_contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(15)
);

-- Tabla PROPIETARIOS
CREATE TABLE propietarios (
    id_propietario VARCHAR(20) PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla INQUILINOS
CREATE TABLE inquilinos (
    id_inquilino VARCHAR(20) PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla INMUEBLES
CREATE TABLE inmuebles (
    id_inmueble SERIAL PRIMARY KEY,
    departamento VARCHAR(100),
    municipio VARCHAR(100),
    barrio VARCHAR(100),
    direccion VARCHAR(255) NOT NULL,
    tipo_inmueble VARCHAR(50),
    area_m2 DECIMAL(10,2),
    habitaciones INTEGER,
    banos INTEGER,
    deposito INTEGER,
    parqueaderos INTEGER DEFAULT 0,
    estrato INTEGER,
    estado_ocupacion VARCHAR(20) DEFAULT 'disponible',
    id_propietario VARCHAR(20) REFERENCES propietarios(id_propietario)
);

-- Tabla CONTRATOS
CREATE TABLE contratos (
    id_contrato SERIAL PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    valor_mensual DECIMAL(12,2) NOT NULL,
    deposito DECIMAL(12,2),
    estado INTEGER DEFAULT 1,
    url_pdf VARCHAR(500),
    id_inmueble INTEGER REFERENCES inmuebles(id_inmueble),
    id_inquilino VARCHAR(20) REFERENCES inquilinos(id_inquilino)
);

-- Tabla PAGOS
CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    fecha_pago DATE,
    monto_total DECIMAL(12,2) NOT NULL,
    saldo_pendiente DECIMAL(12,2) DEFAULT 0,
    mes_correspondiente DATE NOT NULL,
    estado INTEGER DEFAULT 1,
    tipo_transaccion VARCHAR(50),
    observaciones TEXT,
    id_contrato INTEGER REFERENCES contratos(id_contrato)
);

