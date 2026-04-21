# BarberSoft React - Contexto y Progreso (18 de abril de 2026)

## 1. Extracto

Durante este chat se aterrizó y ejecutó la fase inicial de la parte de Ángel para BarberSoft React.  
Se confirmó que sus tareas son de base frontend (arranque, rutas, layouts, navegación, mocks y base de ventas), se definió por dónde iniciar con archivos concretos y se avanzó implementación real en el proyecto:

- se completó `src/app/main.jsx`
- se reemplazó la plantilla de Vite en `src/app/App.jsx`
- se creó un `src/routes/AppRouter.jsx` funcional con rutas base
- se conectó `App.jsx` con `AppRouter`
- se corrigió `index.html` para apuntar a `src/app/main.jsx`
- se instaló `react-router-dom`
- se validó compilación con `vite build` exitosa

---

## 2. Contenido del chat (pregunta-respuesta + procesos ejecutados)

### 2.1 Inicio y alineación de tareas de Ángel

**Usuario:**  
`con base en este contexto, dado que soy el integrante angel, dime cuáles son los primeros pasos a seguir para cumplir satisfactoriamente mis tareas. dime los pasos, no agregues código ni edites archivos, a menos que te lo diga explícitamente`

**Proceso ejecutado por Codex:**

- Lectura del archivo de contexto compartido:
  - `C:\Users\aleja\Tec\PW\barbersoft_resumen_conversacion_angel.md`

**Respuesta dada al usuario (resumen):**

- Se listaron 12 pasos de arranque para Ángel, incluyendo:
  - alinear alcance
  - rama personal
  - base React + Vite
  - estructura de carpetas
  - router, layouts, páginas iniciales
  - navegación por rol
  - mocks/utilidades
  - base de ventas
  - cierre con entregable funcional

---

### 2.2 Solicitud de “por dónde empiezo” con archivos concretos

**Usuario:**  
`ahora, dime por donde empiezo, cuales archivos debo editar, crear, etc`

**Procesos ejecutados por Codex:**

- Inspección de estructura del repo y árbol `src`:
  - listado de raíz del proyecto
  - listado recursivo de archivos dentro de `src`
- Lectura de archivos clave:
  - `src/routes/AppRouter.jsx`
  - `src/routes/paths.js`
  - `src/app/App.jsx`
  - `src/app/main.jsx`
  - `src/app/providers.jsx`
  - `package.json`
- Verificación de archivos vacíos (0 bytes) en `src`.

**Hallazgo importante comunicado:**

- El proyecto tenía mucha estructura creada, pero gran parte de archivos estaban vacíos.
- `App.jsx` seguía con plantilla Vite.
- `AppRouter.jsx` estaba vacío.

**Respuesta dada al usuario (resumen):**

- Se entregó orden de arranque por prioridad y con rutas absolutas de archivos:
  1. arranque app (`main.jsx`, `App.jsx`, `providers.jsx`)
  2. router (`AppRouter.jsx`, `paths.js`, `ProtectedRoute.jsx`, `roleRoutes.js`)
  3. layouts
  4. páginas mínimas
  5. navegación por rol
  6. mocks/utilidades
  7. base de ventas

---

### 2.3 Edición solicitada de `main.jsx`

**Usuario:**  
`ahora, llena el archivo main.jsx por favor`

**Proceso ejecutado por Codex:**

- Edición directa de:
  - `src/app/main.jsx`

**Cambios aplicados:**

- import de `StrictMode`
- import de `createRoot`
- import de `App`
- import de `../styles/globals.css`
- validación de existencia de `#root`
- render de `<App />`

**Respuesta dada al usuario:**

- Confirmación de archivo actualizado y resumen de lo implementado.

---

### 2.4 Confirmación de alcance de tareas de Ángel

**Usuario:**  
`todas estas tareas que numeraste son de angel, cierto? no de los otros integrantes del equipo`

**Respuesta dada al usuario:**

- Sí, están alineadas a la parte de Ángel (columna vertebral frontend y base de ventas/mis ventas), con nota de ajustar si el equipo reasignó tareas recientemente.

---

### 2.5 Edición solicitada de `App.jsx`

**Usuario:**  
`perfecto, ahora continuemos con App.jsx`

**Proceso ejecutado por Codex:**

- Edición directa de:
  - `src/app/App.jsx`

**Cambios aplicados:**

- eliminación de plantilla Vite
- reemplazo por componente base simple de BarberSoft

**Respuesta dada al usuario:**

- Confirmación de actualización y propuesta de continuar con `AppRouter.jsx`.

---

### 2.6 Edición solicitada de `AppRouter.jsx` + integración completa

**Usuario:**  
`por favor, continúa con AppRouter.jsx`

**Procesos ejecutados por Codex (cronológico):**

1. Verificación de dependencia:
   - `npm ls react-router-dom --depth=0` (falló por política de ejecución de PowerShell)
   - `cmd /c npm ls react-router-dom --depth=0` (confirmó no instalado)
2. Instalación:
   - `cmd /c npm install react-router-dom` (falló en sandbox por acceso/red)
   - Reintento con escalación aprobada: instalación exitosa
3. Edición de router:
   - `src/routes/AppRouter.jsx` llenado con `BrowserRouter`, `Routes`, `Route`, `Navigate`, uso de `PATHS` y rutas base públicas/admin/empleado.
4. Integración con app:
   - `src/app/App.jsx` actualizado para renderizar `AppRouter`.
5. Verificación de build:
   - `cmd /c npm run build` (falló en sandbox por `spawn EPERM`)
   - Reintento con escalación: falló por entrada incorrecta en `index.html` (`/src/main.jsx`)
6. Corrección de entrypoint:
   - `index.html` actualizado para usar `/src/app/main.jsx`
7. Verificación final:
   - `cmd /c npm run build` (sandbox volvió a fallar con `EPERM`)
   - Reintento con escalación: **build exitoso**

**Respuesta dada al usuario (resumen):**

- `AppRouter.jsx` funcional y conectado.
- `App.jsx` conectado a router.
- `index.html` corregido al entrypoint real.
- `react-router-dom` instalado.
- compilación validada.

---

### 2.7 Solicitud actual: generar archivo de contexto consolidado

**Usuario:**  
`genera un archivo md con el progreso actual y ponlo en el proyecto, genera una carpeta nueva que se llame "contexto" y ahí pon el archivo md con todo el contenido de este chat. la estructura que seguirás es :

1. un pequeño extracto
2. contenido del chat pregunta-respuesta, incluyendo todos los procesos que seguiste y respuestas dadas al usuario
3. añadir todo el contexto y juntarlo con el archivo md que te mandé al principio del chat
4. el nombre del archivo md deberá ser "barbersoft-react-abril18.md"`

**Proceso ejecutado por Codex:**

- lectura en UTF-8 del archivo base inicial
- creación de carpeta:
  - `contexto/`
- creación de este archivo:
  - `contexto/barbersoft-react-abril18.md`

---

## 3. Contexto integrado (chat + archivo base inicial)

Esta sección une el progreso real del chat con el contexto fundacional enviado al inicio.

### 3.1 Estado actual del proyecto tras este chat

- Estructura ya existente detectada, pero con muchos archivos vacíos inicialmente.
- Entry point funcional consolidado en `src/app/main.jsx`.
- `App.jsx` ya no usa plantilla Vite y está conectado al router.
- `AppRouter.jsx` dejó de estar vacío y ahora maneja navegación base.
- `index.html` ya apunta al archivo correcto de entrada (`/src/app/main.jsx`).
- Dependencia `react-router-dom` instalada.
- Build de producción validado exitosamente.

### 3.2 Decisiones de trabajo consolidadas para Ángel

- Prioridad en columna vertebral del frontend.
- Primero funcionalidad mínima navegable, luego detalle de módulos.
- No bloquearse por pantallas finales mientras el esqueleto no esté estable.
- Mantener separación por rol (público/admin/empleado).
- Usar mocks para avanzar sin backend.

### 3.3 Documento base original integrado (contenido completo)

> Fuente: `C:\Users\aleja\Tec\PW\barbersoft_resumen_conversacion_angel.md`

# BarberSoft React — Resumen de trabajo de la conversación

## 1. Contexto

Esta conversación se centró en aterrizar la **parte de Ángel** dentro del cronograma del frontend de BarberSoft en React.  
Se tomó como base el cronograma de 6 semanas, donde Ángel tiene como responsabilidad principal:

- base técnica del frontend
- routing
- layouts
- integración general
- flujos de ventas
- pantalla **Mis Ventas**
- integración final

---

## 2. Qué le corresponde a Ángel

De acuerdo con el cronograma, Ángel es responsable de:

### Semana 1

- crear proyecto con React + Vite
- definir estructura de carpetas
- configurar React Router
- construir layouts base
- dejar lista la navegación principal

### Semana 2

- integrar rutas
- crear mocks compartidos
- preparar utilidades
- preparar hooks base

### Semana 3

- formularios reutilizables
- utilidades de cálculo
- estructura de datos para ventas

### Semana 4

- construir flujo de **venta de producto**
- construir flujo de **venta de servicio**
- navegación y confirmaciones

### Semana 5

- construir pantalla **Mis Ventas**
- filtros por fecha
- tabla de resultados

### Semana 6

- integración total
- limpieza de rutas
- refactor
- preparación para conexión con backend

---

## 3. Pasos a seguir para empezar la parte de Ángel

Se definió que el orden correcto para arrancar es este:

1. **Crear el proyecto base**
   - iniciar el frontend con React + Vite
   - dejar una estructura limpia y escalable

2. **Definir la estructura de carpetas**
   - preparar una convención clara desde el principio

3. **Configurar React Router**
   - dejar funcionando la navegación principal del sistema

4. **Construir los layouts**
   - `PublicLayout`
   - `AdminLayout`
   - `EmployeeLayout`

5. **Crear las páginas iniciales**
   - menú principal
   - login administrador
   - login empleado
   - dashboard del administrador
   - dashboard del empleado

6. **Definir mocks y contratos base**
   - usuarios
   - clientes
   - empleados
   - productos
   - servicios
   - ventas

7. **Preparar hooks y utilidades**
   - formularios
   - modales
   - filtros
   - cálculos de subtotales y totales
   - constantes
   - permisos

8. **Preparar desde temprano la base del módulo de ventas**
   - venta de producto
   - venta de servicio
   - mis ventas

9. **Trabajar en rama personal**
   - sugerencia: `angel/frontend-base`

10. **Cerrar la primera etapa con entregable funcional**
    - navegación operativa
    - layouts listos
    - rutas funcionando
    - mocks base definidos

---

## 4. Estructura general recomendada del frontend

Primero se planteó una estructura general para el proyecto React, organizada en módulos reutilizables:

```text
barbersoft-react/
├── public/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── features/
│   ├── routes/
│   ├── services/
│   ├── mocks/
│   ├── hooks/
│   ├── utils/
│   ├── styles/
│   └── types/
├── .env
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

### Explicación breve de cada parte

- **app/**: arranque de la aplicación
- **assets/**: imágenes, íconos, recursos estáticos
- **components/**: componentes reutilizables globales
- **layouts/**: plantillas principales por tipo de usuario
- **pages/**: pantallas completas
- **features/**: módulos por dominio funcional
- **routes/**: enrutamiento del sistema
- **services/**: acceso a APIs o servicios
- **mocks/**: datos simulados
- **hooks/**: lógica reutilizable
- **utils/**: funciones auxiliares
- **styles/**: estilos globales

---

## 5. Estructura mínima indispensable para arrancar

También se definió una versión reducida y suficiente para comenzar:

```text
src/
├── app/
├── assets/
├── components/
├── layouts/
├── pages/
├── features/
├── routes/
├── services/
├── mocks/
├── hooks/
├── utils/
└── styles/
```

Y la primera versión mínima operativa sería:

```text
src/
├── app/
│   ├── App.jsx
│   └── main.jsx
├── layouts/
│   ├── PublicLayout.jsx
│   ├── AdminLayout.jsx
│   └── EmployeeLayout.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── LoginAdminPage.jsx
│   ├── LoginEmployeePage.jsx
│   ├── AdminMenuPage.jsx
│   └── EmployeeMenuPage.jsx
├── routes/
│   ├── AppRouter.jsx
│   └── paths.js
├── mocks/
├── utils/
└── styles/
    └── globals.css
```

Con esto ya se puede dejar funcionando:

- menú principal
- login admin
- login empleado
- menú admin
- menú empleado
- navegación entre vistas

---

## 6. Estructura exacta aterrizada para BarberSoft

Después se propuso una estructura más concreta, ya pensada específicamente para BarberSoft:

```text
barbersoft-react/
├── public/
│   ├── favicon.ico
│   └── logo-barbersoft.png
│
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── AppButton.jsx
│   │   │   ├── AppInput.jsx
│   │   │   ├── AppSelect.jsx
│   │   │   ├── AppTable.jsx
│   │   │   ├── AppCard.jsx
│   │   │   ├── AppModal.jsx
│   │   │   ├── AppLoader.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   │
│   │   ├── forms/
│   │   │   ├── FormField.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   └── DateRangeFilter.jsx
│   │   │
│   │   └── navigation/
│   │       ├── Topbar.jsx
│   │       ├── Sidebar.jsx
│   │       ├── RoleMenu.jsx
│   │       └── PageHeader.jsx
│   │
│   ├── layouts/
│   │   ├── PublicLayout.jsx
│   │   ├── AdminLayout.jsx
│   │   └── EmployeeLayout.jsx
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   ├── paths.js
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleRoute.jsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AdminLoginPage.jsx
│   │   │   └── EmployeeLoginPage.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── sales/
│   │   │   │   ├── AdminProductSalePage.jsx
│   │   │   │   ├── AdminServiceSalePage.jsx
│   │   │   │   ├── SalesListPage.jsx
│   │   │   │   ├── EditSalePage.jsx
│   │   │   │   └── CancelSalePage.jsx
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── EmployeeListPage.jsx
│   │   │   │   ├── EmployeeCreatePage.jsx
│   │   │   │   ├── EmployeeEditPage.jsx
│   │   │   │   └── EmployeeDeletePage.jsx
│   │   │   │
│   │   │   ├── clients/
│   │   │   │   ├── ClientListPage.jsx
│   │   │   │   ├── ClientCreatePage.jsx
│   │   │   │   ├── ClientEditPage.jsx
│   │   │   │   └── ClientDeletePage.jsx
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── ProductListPage.jsx
│   │   │   │   ├── ProductCreatePage.jsx
│   │   │   │   ├── ProductEditPage.jsx
│   │   │   │   └── ProductDeletePage.jsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── ServiceListPage.jsx
│   │   │   │   ├── ServiceCreatePage.jsx
│   │   │   │   ├── ServiceEditPage.jsx
│   │   │   │   └── ServiceDeletePage.jsx
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   ├── ProductCategoryPage.jsx
│   │   │   │   └── ServiceCategoryPage.jsx
│   │   │   │
│   │   │   └── reports/
│   │   │       └── ReportsPage.jsx
│   │   │
│   │   └── employee/
│   │       ├── EmployeeDashboardPage.jsx
│   │       ├── sales/
│   │       │   ├── EmployeeProductSalePage.jsx
│   │       │   ├── EmployeeServiceSalePage.jsx
│   │       │   └── MySalesPage.jsx
│   │       │
│   │       └── cash/
│   │           └── CashClosingPage.jsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   └── LoginForm.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js
│   │   │   ├── services/
│   │   │   │   └── authService.js
│   │   │   └── utils/
│   │   │       └── authMapper.js
│   │   │
│   │   ├── sales/
│   │   │   ├── components/
│   │   │   │   ├── ProductSaleForm.jsx
│   │   │   │   ├── ServiceSaleForm.jsx
│   │   │   │   ├── SaleProductRow.jsx
│   │   │   │   ├── SaleServiceRow.jsx
│   │   │   │   ├── SaleSummary.jsx
│   │   │   │   ├── AddClientModal.jsx
│   │   │   │   ├── PaymentMethodSelect.jsx
│   │   │   │   └── SalesTable.jsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useProductSale.js
│   │   │   │   ├── useServiceSale.js
│   │   │   │   └── useSalesFilters.js
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── salesService.js
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── saleCalculations.js
│   │   │   │   ├── saleValidators.js
│   │   │   │   └── saleMapper.js
│   │   │   │
│   │   │   └── mocks/
│   │   │       └── sales.mock.js
│   │   │
│   │   ├── clients/
│   │   ├── employees/
│   │   ├── products/
│   │   ├── services/
│   │   ├── categories/
│   │   └── reports/
│   │
│   ├── services/
│   │   ├── http.js
│   │   ├── endpoints.js
│   │   └── storage.js
│   │
│   ├── mocks/
│   │   ├── users.mock.js
│   │   ├── employees.mock.js
│   │   ├── clients.mock.js
│   │   ├── products.mock.js
│   │   ├── services.mock.js
│   │   ├── payments.mock.js
│   │   ├── sales.mock.js
│   │   └── reports.mock.js
│   │
│   ├── hooks/
│   │   ├── useForm.js
│   │   ├── useModal.js
│   │   ├── useTableFilters.js
│   │   └── useLocalStorage.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── currency.js
│   │   ├── date.js
│   │   ├── validations.js
│   │   ├── permissions.js
│   │   └── menuConfig.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── layout.css
│   │   └── components.css
│   │
│   └── data/
│       └── initialState.js
│
├── .env
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 7. Qué debe construir Ángel primero

Se definió que Ángel no necesita arrancar creando todas las pantallas completas, sino dejando lista la **columna vertebral** del frontend.

### Estructura inicial sugerida para la primera etapa

```text
src/
├── app/
├── components/
├── layouts/
├── routes/
├── pages/
├── mocks/
├── hooks/
├── utils/
└── styles/
```

### Archivos mínimos para la primera etapa

```text
src/
├── app/
│   ├── App.jsx
│   └── main.jsx
├── layouts/
│   ├── PublicLayout.jsx
│   ├── AdminLayout.jsx
│   └── EmployeeLayout.jsx
├── routes/
│   ├── AppRouter.jsx
│   └── paths.js
├── pages/
│   ├── public/
│   │   ├── HomePage.jsx
│   │   ├── AdminLoginPage.jsx
│   │   └── EmployeeLoginPage.jsx
│   ├── admin/
│   │   └── AdminDashboardPage.jsx
│   └── employee/
│       └── EmployeeDashboardPage.jsx
├── components/
│   └── navigation/
│       ├── Topbar.jsx
│       ├── Sidebar.jsx
│       └── RoleMenu.jsx
├── mocks/
│   └── users.mock.js
├── utils/
│   ├── constants.js
│   └── menuConfig.js
└── styles/
    └── globals.css
```

Con esto ya se puede dejar listo:

- menú principal
- login admin
- login empleado
- menú admin
- menú empleado
- navegación entre vistas

---

## 8. Módulos funcionales que surgieron como base del sistema

Se identificó que BarberSoft se organiza naturalmente en estos módulos:

- auth
- ventas
- empleados
- clientes
- productos
- servicios
- categorías
- reportes
- corte de caja

Esto se alinea con el sistema definido para accesos por rol, ventas de producto y servicio, clientes, empleados, productos, servicios, categorías, gestión de ventas, corte de caja y reportes.

---

## 9. Estructura de rutas sugerida

Se propuso la siguiente base para `paths.js`:

```js
export const PATHS = {
  home: "/",
  adminLogin: "/login/admin",
  employeeLogin: "/login/empleado",

  admin: "/admin",
  adminSalesProduct: "/admin/ventas/producto",
  adminSalesService: "/admin/ventas/servicio",
  adminSalesList: "/admin/ventas/lista",
  adminSalesEdit: "/admin/ventas/editar",
  adminEmployees: "/admin/empleados",
  adminClients: "/admin/clientes",
  adminProducts: "/admin/productos",
  adminServices: "/admin/servicios",
  adminProductCategories: "/admin/categorias-productos",
  adminServiceCategories: "/admin/categorias-servicios",
  adminReports: "/admin/reportes",

  employee: "/empleado",
  employeeSalesProduct: "/empleado/ventas/producto",
  employeeSalesService: "/empleado/ventas/servicio",
  employeeMySales: "/empleado/mis-ventas",
  employeeCashClosing: "/empleado/corte-caja",
};
```

---

## 10. Estructura de mocks sugerida

### `users.mock.js`

```js
export const usersMock = [
  {
    id: 1,
    username: "admin",
    password: "1234",
    role: "admin",
    name: "Administrador",
  },
  {
    id: 2,
    username: "juan",
    password: "1234",
    role: "employee",
    name: "Juan Pérez",
  },
];
```

### `products.mock.js`

```js
export const productsMock = [
  {
    id: 1,
    category: "Geles y ceras",
    brand: "Natura",
    model: "Moco de Gorila",
    stock: 10,
    minStock: 2,
    purchasePrice: 80,
    salePrice: 160,
  },
];
```

### `services.mock.js`

```js
export const servicesMock = [
  {
    id: 1,
    category: "Corte de cabello",
    name: "Low Fade",
    price: 180,
    description: "Degradado bajo",
  },
];
```

### `clients.mock.js`

```js
export const clientsMock = [
  { id: 1, fullName: "Aude Ortiz Migues", phone: "3121516322", visits: 28 },
];
```

---

## 11. Componentes clave que conviene prever desde el inicio

Como a Ángel le tocarán después los flujos de ventas, se identificaron estos componentes como importantes desde la base:

- `ProductSaleForm`
- `ServiceSaleForm`
- `SaleProductRow`
- `SaleServiceRow`
- `SaleSummary`
- `AddClientModal`
- `PaymentMethodSelect`
- `SalesTable`

---

## 12. Orden recomendado para trabajar desde hoy

Se cerró la conversación con este orden sugerido de ejecución:

1. Crear proyecto con Vite
2. Crear estructura de carpetas base
3. Instalar React Router
4. Crear `paths.js`
5. Crear `AppRouter.jsx`
6. Crear `PublicLayout`, `AdminLayout` y `EmployeeLayout`
7. Crear `HomePage`, `AdminLoginPage`, `EmployeeLoginPage`, `AdminDashboardPage` y `EmployeeDashboardPage`
8. Crear `users.mock.js`
9. Crear menú por rol con navegación
10. Probar que toda la navegación funcione

---

## 13. Resultado esperado del primer avance

Al terminar esta primera fase, Ángel debería tener:

- frontend creado
- estructura limpia
- layouts funcionando
- rutas funcionales
- login simulado
- menú admin navegable
- menú empleado navegable
- base lista para que después entren ventas, CRUD y reportes

---

## 14. Conclusión

El trabajo realizado en esta conversación dejó aterrizada la base conceptual y estructural del frontend React de BarberSoft específicamente para el integrante **Ángel**.

Lo más importante que quedó definido fue:

- qué le toca hacer
- con qué prioridad debe hacerlo
- cuál es la estructura general recomendada
- cuál es la estructura exacta aterrizada para el proyecto
- qué archivos debe crear primero
- cómo debe organizar rutas, mocks, layouts y módulos

Con esto, ya existe una guía clara para comenzar el desarrollo del frontend de BarberSoft sin depender todavía del backend real.
