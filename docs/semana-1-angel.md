# Semana 1 - Actividades de Angel

Fuente revisada: `C:\Users\aleja\Tec\PW\ITINERARIO_PROYECTO_REACT_NODEJS_COMPLETO.docx`.

## Actividades solicitadas

1. `[Frontend] Crear proyecto React con Vite, routing, layout general y navegacion Admin/Empleado.`
2. `[Backend] Inicializar API Node.js, estructura de carpetas, variables de entorno y endpoint de salud.`

## Pasos documentados

1. Se reviso el itinerario y se confirmo que las dos actividades pertenecen a Angel en la semana 1.
2. Se inspecciono el repositorio y se confirmo que el proyecto React con Vite ya existia.
3. Se confirmo que el frontend ya tenia `BrowserRouter`, layouts `AdminLayout` y `EmployeeLayout`, rutas base y menu lateral por rol.
4. Se cerraron huecos de navegacion existentes: se agregaron pantallas base para Clientes, Empleados, Mis Ventas y Corte de Caja, y se conectaron al router.
5. Se agregaron estilos base para layout Admin/Empleado, sidebar, menu por rol y contenido principal.
6. Se inicializo la API Node.js en `backend/src` con carpetas `config`, `controllers`, `routes` y `utils`.
7. Se agrego carga simple de variables desde `.env`, con ejemplo en `backend/.env.example`.
8. Se agrego endpoint de salud en `GET /api/health`, con alias `GET /health`.
9. Se agregaron scripts npm para ejecutar la API desde `backend`: `npm run dev` y `npm run start`.
10. Se separo el proyecto en `frontend/` y `backend/`, dejando scripts de orquestacion en la raiz.
