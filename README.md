# Préstamos Amigo PRO - prototipo

Incluye:
- Planes basados en la imagen suministrada.
- Carrusel de portada.
- Simulador.
- Solicitud de préstamo.
- Datos personales y campos de documentación.
- Panel del prestamista.
- Métricas de capital, cobrado, por cobrar y vencido.
- Vencimientos y alertas.
- Registrar pago.
- Registrar prórroga con nueva fecha.
- Campo para porcentaje de interés/cargo adicional de la prórroga y vista previa del importe.
- Perfil del cliente.
- Historial conceptual y estados.

IMPORTANTE:
Esta es una demo frontend. localStorage solo sirve para probar el flujo. NO debe utilizarse para guardar DNI, fotos, comprobantes ni datos sensibles en producción.

Para convertirla en una aplicación real:
1. Backend y base de datos (por ejemplo PostgreSQL/Supabase).
2. Autenticación y roles cliente/prestamista.
3. Storage privado para DNI y comprobante de domicilio.
4. Auditoría de cambios.
5. Servicio oficial de WhatsApp Business/API para mensajes automáticos.
6. Tareas programadas para avisos antes del vencimiento y después del vencimiento.
7. Pasarela/proveedor de pagos compatible con el modelo de negocio.
8. Contrato y condiciones revisadas profesionalmente.
9. Cumplimiento de normativa de protección de datos y regulación aplicable a préstamos.

El interés/cargo de prórroga queda como un campo configurable en la demo, pero cualquier cargo real debe estar expresamente informado y ser compatible con las condiciones contractuales y normativa aplicable.
