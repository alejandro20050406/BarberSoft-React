# BarberSoft

Aplicacion web para la gestion operativa de una barberia (caso de estudio: Monkey's Barber Shop).

## Contexto del proyecto

BarberSoft nace para resolver un problema operativo real: el registro manual de servicios y ventas (en libreta), que dificulta el control de ingresos, comisiones, inventario y reportes.

Este repositorio separa la implementacion del frontend en React y la base inicial de API en Node.js.

## Nota importante sobre tecnologia

- El frontend usa React + Vite.
- La API inicial usa Node.js con el modulo nativo `http`, sin framework externo por ahora.
- Cualquier referencia historica en documentos a PHP, XAMPP u otras decisiones de backend se considera fuera del alcance actual de este repositorio.

## Objetivo del sistema

Construir una plataforma web que permita:

- Registrar ventas de servicios y productos.
- Gestionar clientes, empleados, servicios, productos y categorias.
- Consultar ingresos, ganancias y comisiones.
- Facilitar corte de caja y reportes por periodo.

## Usuarios y roles

- Administrador
- Empleado (barbero)

## Alcance funcional esperado

Los modulos funcionales definidos para BarberSoft son:

- Autenticacion y permisos por rol.
- Ventas (servicio y producto).
- Mis ventas (vista de empleado por rango de fechas).
- Gestion de empleados.
- Gestion de clientes.
- Gestion de productos e inventario.
- Gestion de servicios.
- Gestion de categorias.
- Corte de caja.
- Reportes de ingresos/ganancias/comisiones.

## Alcance fuera de esta etapa

- No hay portal para clientes finales.
- No se incluye agenda/citas para clientes en esta etapa.
- No es aplicacion de escritorio.
- Persistencia definitiva se definira en una fase posterior.

## Stack tecnico actual

- React
- Vite
- Node.js
- JavaScript (ES Modules)
- ESLint

## Estructura del proyecto

```text
frontend/
|- public/
|- src/
|  |- app/
|  |- assets/
|  |- components/
|  |- features/
|  |- hooks/
|  |- layouts/
|  |- mocks/
|  |- pages/
|  |- routes/
|  |- services/
|  |- styles/
|  |- types/
|  `- utils/
|- index.html
|- package.json
`- vite.config.js

backend/
|- src/
|  |- config/
|  |- controllers/
|  |- routes/
|  |- utils/
|  |- app.js
|  `- index.js
|- .env.example
`- package.json
```

## Estado actual

- Existe una base de estructura por modulos y carpetas.
- El repositorio se encuentra en fase de construccion incremental.
- Existe una API base con endpoint de salud y variables de entorno.
- La conexion funcional frontend-backend se integrara de forma incremental.

## Requisitos previos

- Node.js 20+ recomendado
- npm 10+ recomendado

## Scripts desde la raiz

```bash
npm run dev:frontend
npm run dev:backend
npm run build
npm run lint
npm run frontend:preview
npm run backend:start
```

Tambien se pueden ejecutar scripts directamente desde cada carpeta:

```bash
cd frontend
npm run dev

cd ../backend
npm run dev
```

## API inicial

Variables disponibles en `backend/.env.example`:

```bash
PORT=4000
HOST=localhost
NODE_ENV=development
API_PREFIX=/api
```

Endpoint de salud:

```bash
GET http://localhost:4000/api/health
```

## Flujo de trabajo recomendado

1. Definir rutas y layouts base por rol.
2. Implementar pantallas base de navegacion.
3. Consolidar mocks y contratos de datos de frontend.
4. Implementar modulos de ventas y mis ventas.
5. Integrar CRUDs administrativos.
6. Integrar endpoints de backend de forma incremental.

## Fuente del contexto funcional

Caso de estudio interno:

- `C:\Users\aleja\Tec\IS\t2\reporte-tecnico-2-bueno.pdf`
