# BarberSoft React

Frontend web para la gestion operativa de una barberia (caso de estudio: Monkey's Barber Shop).

## Contexto del proyecto

BarberSoft nace para resolver un problema operativo real: el registro manual de servicios y ventas (en libreta), que dificulta el control de ingresos, comisiones, inventario y reportes.

Este repositorio representa la implementacion del frontend en React.

## Nota importante sobre tecnologia

- Este proyecto se apega a React + Vite para frontend.
- Por el momento no existe un backend/framework de backend definido.
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
- Backend y persistencia definitiva se definiran en una fase posterior.

## Stack tecnico actual

- React
- Vite
- JavaScript (ES Modules)
- ESLint

## Estructura de frontend (actual)

```text
src/
|- app/
|- assets/
|- components/
|- features/
|- hooks/
|- layouts/
|- mocks/
|- pages/
|- routes/
|- services/
|- styles/
|- types/
`- utils/
```

## Estado actual

- Existe una base de estructura por modulos y carpetas.
- El repositorio se encuentra en fase de construccion incremental.
- La conexion a backend aun no aplica; se trabajara con contratos/mocks hasta definir arquitectura de servidor.

## Requisitos previos

- Node.js 20+ recomendado
- npm 10+ recomendado

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Flujo de trabajo recomendado (frontend-first)

1. Definir rutas y layouts base por rol.
2. Implementar pantallas base de navegacion.
3. Consolidar mocks y contratos de datos de frontend.
4. Implementar modulos de ventas y mis ventas.
5. Integrar CRUDs administrativos.
6. Preparar capa de servicios para futura integracion con backend real.

## Fuente del contexto funcional

Caso de estudio interno:

- `C:\Users\aleja\Tec\IS\t2\reporte-tecnico-2-bueno.pdf`
