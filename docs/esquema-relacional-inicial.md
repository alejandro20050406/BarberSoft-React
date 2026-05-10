# Esquema relacional inicial

## Alcance

Se definio un esquema inicial para las entidades pedidas:

- `usuarios`
- `empleados`
- `clientes`
- `servicios`
- `productos`
- `ventas`

Para que `ventas` pueda mezclar servicios y productos sin perder integridad, se agrego la tabla auxiliar `venta_detalles`.

## Relaciones

- `empleados.usuario_id -> usuarios.id`
- `ventas.cliente_id -> clientes.id`
- `ventas.empleado_id -> empleados.id`
- `ventas.usuario_id -> usuarios.id`
- `venta_detalles.venta_id -> ventas.id`
- `venta_detalles.servicio_id -> servicios.id`
- `venta_detalles.producto_id -> productos.id`

## Decisiones de modelado

- `usuarios` concentra autenticacion, rol y estado.
- `empleados` extiende a `usuarios` con datos operativos y comision.
- `clientes` queda desacoplado del login en esta fase.
- `servicios` y `productos` comparten `estado` para permitir bajas logicas.
- `ventas` guarda encabezado, responsable y totales.
- `venta_detalles` permite registrar lineas de servicio o producto en una misma venta.

## Archivo SQL

- [backend/docs/esquema-relacional-inicial.sql](/c:/Users/migue/OneDrive/Documentos/Proyecto_Web/BarberSoft-React/backend/docs/esquema-relacional-inicial.sql)
