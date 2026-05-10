CREATE TABLE usuarios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'employee')),
  estado VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (estado IN ('active', 'inactive', 'blocked')),
  ultimo_acceso TIMESTAMP NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE empleados (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id),
  nombres VARCHAR(80) NOT NULL,
  apellidos VARCHAR(80) NOT NULL,
  telefono VARCHAR(20),
  email_laboral VARCHAR(120),
  fecha_contratacion DATE,
  porcentaje_comision NUMERIC(5,2) NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (estado IN ('active', 'inactive')),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombres VARCHAR(80) NOT NULL,
  apellidos VARCHAR(80),
  telefono VARCHAR(20),
  email VARCHAR(120),
  fecha_nacimiento DATE,
  notas TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (estado IN ('active', 'inactive')),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  duracion_minutos INTEGER NOT NULL DEFAULT 30 CHECK (duracion_minutos > 0),
  precio_base NUMERIC(10,2) NOT NULL CHECK (precio_base >= 0),
  estado VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (estado IN ('active', 'inactive')),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku VARCHAR(40) UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  marca VARCHAR(80),
  descripcion TEXT,
  precio_compra NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (precio_compra >= 0),
  precio_venta NUMERIC(10,2) NOT NULL CHECK (precio_venta >= 0),
  stock_actual INTEGER NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
  stock_minimo INTEGER NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  estado VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (estado IN ('active', 'inactive')),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ventas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  folio VARCHAR(30) NOT NULL UNIQUE,
  cliente_id BIGINT NULL REFERENCES clientes(id),
  empleado_id BIGINT NOT NULL REFERENCES empleados(id),
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  descuento NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('cash', 'card', 'transfer', 'mixed')),
  estado VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (estado IN ('draft', 'completed', 'cancelled')),
  vendida_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venta_detalles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  venta_id BIGINT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  tipo_item VARCHAR(20) NOT NULL CHECK (tipo_item IN ('service', 'product')),
  servicio_id BIGINT NULL REFERENCES servicios(id),
  producto_id BIGINT NULL REFERENCES productos(id),
  cantidad NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
  total_linea NUMERIC(10,2) NOT NULL CHECK (total_linea >= 0),
  CHECK (
    (tipo_item = 'service' AND servicio_id IS NOT NULL AND producto_id IS NULL)
    OR
    (tipo_item = 'product' AND producto_id IS NOT NULL AND servicio_id IS NULL)
  )
);
