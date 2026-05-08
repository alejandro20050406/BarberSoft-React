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

## Bloque 3 - Actividades solicitadas

1. `[Frontend] Integrar formularios reutilizables para altas, ediciones y bajas logicas.`
2. `[Backend] Implementar endpoints CRUD de productos con stock actual, stock minimo, costo y precio.`

## Bloque 3 - Pasos documentados

1. Se reviso la pantalla `frontend/src/pages/admin/ProductsPage.jsx` para identificar el flujo existente de inventario: listado, filtros, formulario local, edicion y cambio de estado.
2. Se confirmo que el producto usaba datos mock en frontend y que el backend todavia no exponia rutas para productos.
3. Se tomo como referencia el CRUD de categorias ya existente en backend, porque maneja respuestas normalizadas con `ok`, `data`, `message` y `errors`.
4. Se creo `backend/src/data/productStore.js` como store temporal en memoria para productos mientras no exista base de datos conectada.
5. Se agrego una semilla inicial de producto con categoria, marca, modelo, stock actual, stock minimo, costo, precio y estado activo.
6. Se agrego validacion centralizada para altas y ediciones: categoria obligatoria, marca obligatoria, modelo obligatorio, producto duplicado por marca/modelo, stock actual entero mayor o igual a cero, stock minimo entero mayor o igual a cero, costo valido y precio mayor a cero.
7. Se implemento `list(filters)` para consultar productos con filtros por texto, categoria y estado.
8. Se implemento `create(payload)` para altas de productos y asignacion automatica de `id`.
9. Se implemento `update(id, payload)` para ediciones completas sin perder el estado actual del producto.
10. Se implemento `setStatus(id, status)` para bajas logicas y reactivaciones usando los estados `active` e `inactive`.
11. Se creo `backend/src/routes/productRoutes.js` con el parser de rutas para `/api/products`, `/api/products/:id` y `/api/products/:id/status`.
12. Se conectaron los endpoints `GET /api/products`, `POST /api/products`, `PUT /api/products/:id` y `PATCH /api/products/:id/status`.
13. Se registro `handleProductRoutes` en `backend/src/app.js` para que la API atienda el modulo de productos.
14. Se actualizo el script de lint backend para incluir los nuevos archivos `productStore.js` y `productRoutes.js`.
15. Se creo `frontend/src/services/productsService.js` para encapsular las llamadas HTTP de productos y construir query strings de filtros.
16. Se reutilizo el contrato HTTP existente de `frontend/src/services/http.js`, evitando duplicar logica de `fetch`, serializacion JSON y manejo de errores.
17. Se completo `frontend/src/components/forms/FormField.jsx` como campo reutilizable con etiqueta, contenido y mensaje de error.
18. Se creo `frontend/src/components/forms/CatalogForm.jsx` como contenedor reutilizable para formularios de alta y edicion, con titulo, area de campos, mensaje de error, boton principal y cancelacion.
19. Se refactorizo `ProductsPage` para cargar productos desde `productsService.list()` en lugar de leer `productsMock`.
20. Se conectaron los filtros de busqueda, categoria y estado contra el endpoint `GET /api/products`.
21. Se conecto el alta de productos contra `POST /api/products`.
22. Se conecto la edicion de productos contra `PUT /api/products/:id`.
23. Se conecto la baja logica y reactivacion contra `PATCH /api/products/:id/status`.
24. Se cargo el catalogo de categorias desde `productCategoriesService` para poblar el selector de categorias y mantener la pantalla alineada con el backend.
25. Se agregaron estados de carga, guardado y error para que la pantalla muestre retroalimentacion cuando la API no responda o rechace datos.
26. Se actualizaron las etiquetas visibles del inventario para reflejar los campos solicitados: stock actual, stock minimo, costo y precio.
