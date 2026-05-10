# Sistema visual base BarberSoft

## Objetivo

Definir una base coherente para los componentes operativos del sistema: botones, inputs, tablas, estados y mensajes. La intencion es que admin, empleados y futuros modulos compartan el mismo lenguaje visual sin rehacer estilos por pantalla.

## Principios

- Apariencia premium y sobria: fondo marfil, superficies claras y acento dorado.
- Jerarquia operativa: acciones primarias visibles, acciones secundarias contenidas, errores muy claros.
- Lectura rapida: tablas compactas, etiquetas cortas y estados con color + texto.
- Consistencia: todos los estados usan la misma semantica visual en formularios, listados y dialogos.

## Tokens base

- Color primario: `--color-gold`
- Fondo app: `--color-bg`
- Superficie: `--color-bg-card`
- Campo: `--color-bg-input`
- Texto principal: `--color-text`
- Texto secundario: `--color-text-muted`
- Exito: `--color-success`
- Advertencia: `--color-warning`
- Error: `--color-danger`
- Informacion: `--color-info`

## Componentes

### Botones

- `primary`: accion principal del flujo, por ejemplo guardar, crear, confirmar.
- `secondary`: accion alternativa, por ejemplo cancelar, volver, filtrar.
- `danger`: accion destructiva o sensible, por ejemplo desactivar o eliminar.
- `ghost`: accion de baja jerarquia dentro de toolbars o filas.

### Inputs

El componente `Input` cubre `input`, `textarea` y `select` mediante la prop `as`.

Estados visuales:

- Normal: borde neutro y sombra suave.
- Focus: aro dorado y borde acentuado.
- Error: borde rojizo y mensaje inferior.
- Disabled: fondo atenuado y cursor bloqueado.

### Tablas

El componente `Table` queda orientado a catalogos y movimientos:

- Header oscuro para jerarquia.
- Hover suave para lectura de filas.
- `render` por columna para celdas custom.
- `getRowClassName` para resaltar filas editadas, alertas o estados.
- Estado vacio integrado.

### Estados

`StatusBadge` unifica las etiquetas de estado:

- `active` -> exito
- `inactive` -> neutral
- `pending` -> advertencia
- `blocked` o `error` -> peligro
- `info` -> informativo

### Mensajes

- `SuccessMessage`: confirmaciones y respuestas positivas.
- `ErrorMessage`: errores de validacion, red o negocio.

## Archivos base

- [variables.css](/c:/Users/migue/OneDrive/Documentos/Proyecto_Web/BarberSoft-React/frontend/src/styles/variables.css)
- [Button.jsx](/c:/Users/migue/OneDrive/Documentos/Proyecto_Web/BarberSoft-React/frontend/src/components/ui/Button/Button.jsx)
- [Input.jsx](/c:/Users/migue/OneDrive/Documentos/Proyecto_Web/BarberSoft-React/frontend/src/components/ui/Input/Input.jsx)
- [Table.jsx](/c:/Users/migue/OneDrive/Documentos/Proyecto_Web/BarberSoft-React/frontend/src/components/ui/Table/Table.jsx)
- [StatusBadge.jsx](/c:/Users/migue/OneDrive/Documentos/Proyecto_Web/BarberSoft-React/frontend/src/components/feedback/StatusBadge.jsx)
- [SuccessMessage.jsx](/c:/Users/migue/OneDrive/Documentos/Proyecto_Web/BarberSoft-React/frontend/src/components/feedback/SuccessMessage.jsx)
- [ErrorMessage.jsx](/c:/Users/migue/OneDrive/Documentos/Proyecto_Web/BarberSoft-React/frontend/src/components/feedback/ErrorMessage.jsx)
