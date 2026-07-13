# NovaLearn — Project Status

Última actualización: 2026-07-12

## 1. Resumen ejecutivo

NovaLearn ya no está en fase de planificación. Existe un backend Spring Boot funcional, un frontend Next.js funcional, una base PostgreSQL administrada por Flyway y varios módulos completos o parcialmente implementados.

## 2. Entorno validado

### Backend

- Java 21.
- Maven 3.9.x.
- Spring Boot 3.5.x.
- PostgreSQL 17.
- Ejecución local mediante `novalearn-backend/run-local.ps1`.
- Build habitual: `mvn clean package -DskipTests`.

### Frontend

- Next.js 16.
- React.
- TypeScript.
- Tailwind CSS.
- Build habitual: `npm run lint` y `npm run build`.

## 3. Funcionalidades implementadas

### Autenticación y usuarios

- Registro y login.
- Registro público de estudiantes desde `/register`, sin selector de rol.
- Registro público de estudiantes con verificación automática de correo
  disponible antes de enviar el formulario, manteniendo la validación
  única en backend y base de datos como respaldo.
- Inicio de sesión en dos pasos con OTP por correo en cada acceso:
  primero valida credenciales y luego crea la sesión solo si el código
  temporal es correcto. El OTP de login puede desactivarse temporalmente
  mediante `LOGIN_OTP_ENABLED=false` sin eliminar la implementación.
- Nota operativa: para desarrollo local se configura `LOGIN_OTP_ENABLED`
  en `novalearn-backend/.env`; para despliegue se configura la misma
  variable en el panel de variables de entorno del backend, por ejemplo
  Render. Mientras no exista dominio/correo verificado en Resend, se
  recomienda mantener `LOGIN_OTP_ENABLED=false`. Para reactivar el OTP
  solo se cambia a `LOGIN_OTP_ENABLED=true` y se reinicia el backend.
- Recuperación de contraseña mediante código OTP por correo, con cambio
  de contraseña y revocación de sesiones renovables activas al completarse.
- JWT.
- Refresh tokens.
- Roles `ADMIN`, `INSTRUCTOR` y `STUDENT`.
- Guards y autorización por rol.
- Login con estado de carga visible, bloqueo contra doble envío y
  notificaciones toast para errores como credenciales inválidas o cuenta
  inactiva.
- Estados operativos de usuario normalizados a `ACTIVE` e `INACTIVE`.
- Alta administrativa de usuarios normalizada con nombres completos,
  apellido paterno y apellido materno.
- Alta administrativa de usuarios con verificación preventiva de correo
  disponible antes de registrar, manteniendo la restricción única de base
  de datos como respaldo.
- Configuración de usuario.
- Notificaciones internas.
- Auditoría base.

### Administración de cursos

- Categorías.
- Creación y edición de cursos.
- Cursos gratuitos y de pago.
- Estados de curso normalizados a `DRAFT`, `PUBLISHED` y `ARCHIVED`.
- Imagen de portada mediante Cloudinary.
- Gestión por ADMIN e INSTRUCTOR.
- Ownership del instructor.
- Dashboard administrativo con matrículas por nombre de estudiante,
  cursos más matriculados agregados por curso visible e ingresos
  individuales por venta confirmada usando `payments.paid_at`.
- El formulario administrativo de cursos muestra el precio base, la
  comisión Culqi editable y el precio final que verá el estudiante antes
  de crear o editar un curso de pago.
- La configuración administrativa de cobro permite habilitar Culqi,
  pago manual o ambos, manteniendo al menos un método disponible.
- El módulo administrativo `/admin/revenue` centraliza el detalle completo
  de ingresos, con totales y desglose por venta confirmada.
- El módulo administrativo `/admin/manual-payments` permite revisar
  comprobantes de pagos manuales, aprobarlos para activar matrícula o
  rechazarlos con motivo.

### Contenido

- Módulos.
- Lecciones.
- Tipos de contenido.
- Recursos vinculados a una lección.
- Vista del aula del estudiante.
- Progreso por lección.
- Ruta independiente de cuestionario.
- Eliminación del módulo general redundante de recursos del estudiante.
- Las lecciones `RESOURCE` y su visor individual se conservan.

### Evaluaciones

- Migraciones V20 y V21.
- Entidades y CRUD de evaluaciones.
- Preguntas y opciones.
- Tipos de pregunta objetivos y respuesta corta.
- Modalidades online, texto, archivo e híbrida.
- Fechas, visibilidad, intentos máximos y puntaje aprobatorio.
- Integración de evaluaciones dentro del contenido del curso.

### Motor de intentos

Endpoints implementados:

```text
POST /api/v1/student/evaluations/{evaluationId}/attempts/start
GET  /api/v1/student/evaluations/attempts/{attemptId}
PUT  /api/v1/student/evaluations/attempts/{attemptId}/answers
POST /api/v1/student/evaluations/attempts/{attemptId}/submit
GET  /api/v1/student/evaluations/{evaluationId}/attempts
```

Frontend implementado:

- inicio y reanudación;
- guardado de respuestas;
- temporizador;
- envío;
- resultado;
- estado pendiente de revisión manual.

### Matrículas y progreso

- Inscripciones.
- Restricción única estudiante-curso.
- Soft delete.
- Progreso.
- Mis cursos.
- Acceso al aula solo para estudiantes matriculados.

### Pagos

- Entidades de pago.
- Transacciones.
- Creación de pago.
- Confirmación validada contra Culqi desde backend.
- Pagos manuales con comprobante, revisión administrativa, aprobación,
  rechazo con motivo y activación de matrícula solo al aprobar.
- Historial del estudiante.
- Matrícula después de confirmación exitosa.
- Configuración de Culqi mediante variables de entorno.
- Configuración global de métodos de pago mediante `system_settings`:
  Culqi y pago manual pueden activarse o desactivarse desde administración.

### Catálogo del estudiante

Backend implementado y compilado:

```text
GET /api/v1/student/catalog/courses
GET /api/v1/student/catalog/courses/{courseId}
GET /api/v1/student/catalog/categories
POST /api/v1/student/catalog/courses/{courseId}/enroll
```

Incluye:

- búsqueda;
- filtros;
- cursos publicados;
- estado `enrolled`.
- matrícula gratuita para cursos `FREE`.

Frontend implementado y compilado:

```text
/student/catalog
/student/certificates
/student/evaluations
/student/payments
```

Incluye:

- búsqueda;
- filtros por categoría, tipo, nivel y precio;
- tarjetas de cursos publicados;
- precio público final para el estudiante en cursos de pago, incluyendo
  la comisión de pasarela configurada sin exponer el porcentaje Culqi;
- acciones `Inscribirme gratis`, `Comprar curso` y `Ver curso`;
- navegación del estudiante hacia el catálogo.
- creación de pago `PENDING` desde `Comprar curso`.
- dashboard del estudiante simplificado como resumen con accesos a módulos
  de detalle;
- módulo de certificados del estudiante con tarjetas de certificados
  emitidos, descarga PDF y QR de verificación;
- plantillas personalizadas de certificado por curso en versión 1:
  admin o instructor pueden subir una imagen de plantilla y el backend
  genera el PDF colocando nombre, curso, fecha, código y QR encima;
- editor visual de posiciones para plantillas de certificado: admin o
  instructor pueden arrastrar nombre, curso, fecha, código y QR sobre la
  plantilla y guardar coordenadas por curso;
- módulo `Mis cursos` del estudiante con resumen de progreso, cursos en
  progreso, cursos completados y acceso directo para continuar;
- módulo de pagos del estudiante con historial completo, totales y estados
  traducidos;
- detalle de pago del estudiante con precio del curso, comisión de pasarela,
  total pagado, estado, proveedor y fechas.
- alternativa de pago manual desde el catálogo para cursos de pago,
  subiendo comprobante en imagen o PDF y dejando la compra en revisión.
- el catálogo respeta los métodos de pago habilitados: oculta Culqi,
  pago manual o ambos según configuración administrativa.
- centro global de evaluaciones del estudiante con pendientes, en progreso
  y completadas, conectado a las evaluaciones publicadas de sus cursos
  matriculados.

## 4. Trabajo en progreso inmediato

### Integración real con Culqi

La matrícula gratuita desde catálogo quedó implementada y validada:

```text
POST /api/v1/student/catalog/courses/{courseId}/enroll
```

Archivos confirmados:

```text
StudentFreeEnrollmentController.java
StudentFreeEnrollmentService.java
```

Incluye:

- uso del usuario `STUDENT` autenticado;
- validación de cursos `PUBLISHED`;
- validación de cursos `FREE`;
- prevención de matrículas duplicadas activas;
- reactivación de matrículas eliminadas;
- reinicio de progreso y fecha de matrícula al reactivar;
- `EnrollmentRepository.findByStudentIdAndCourseId(...)`.

Estado: IMPLEMENTADO Y VALIDADO CON BUILD BACKEND.

El checkout mínimo para cursos pagados crea pagos internos en estado `PENDING` mediante:

```text
POST /api/v1/student/payments/create
```

Estado: IMPLEMENTADO Y VALIDADO.

La confirmación de pago consulta el cargo en Culqi antes de marcar un pago como `PAID`:

```text
POST /api/v1/student/payments/confirm
```

Requiere:

- `CULQI_SECRET_KEY`;
- `CULQI_PUBLIC_KEY`;
- `CULQI_API_BASE_URL` opcional.

El frontend del catálogo carga Culqi Checkout, genera un token con la clave pública y envía ese token al backend para crear el cargo real mediante:

```text
POST /api/v1/student/payments/{paymentId}/culqi/charge
```

Requiere:

- `NEXT_PUBLIC_CULQI_PUBLIC_KEY`.

Estado: IMPLEMENTADO Y VALIDADO A NIVEL DE BUILD. FALTA PRUEBA END TO END CON CREDENCIALES CULQI REALES.

El flujo de billeteras móviles/QR quedó integrado mediante órdenes Culqi:

```text
POST /api/v1/student/payments/{paymentId}/culqi/order
POST /api/v1/student/payments/{paymentId}/culqi/order/confirm
POST /api/v1/public/culqi/webhooks/order
```

Incluye:

- creación de orden Culqi desde backend;
- almacenamiento de `provider_order_id`;
- almacenamiento de estado y expiración local de la orden Culqi;
- habilitación de `billetera` en Culqi Checkout;
- consulta segura de la orden antes de activar matrícula;
- webhook público para confirmar órdenes `order.status.changed`;
- validación de rango para billeteras móviles entre S/ 6 y S/ 500.
- creación de órdenes con `confirm: false` para que Custom Checkout
  pueda confirmarlas al generar QR;
- reutilización solo de órdenes vigentes y confirmables;
- bloqueo frontend contra doble clic y apertura duplicada del Checkout.
- cancelación explícita de pagos `PENDING` cuando el estudiante cierra
  el checkout antes de completar la operación;
- ocultamiento de pagos `CANCELLED` en el dashboard del estudiante.

Estado: IMPLEMENTADO Y VALIDADO CON BUILD BACKEND, LINT FRONTEND Y BUILD FRONTEND. FALTA PRUEBA END TO END CON CREDENCIALES CULQI REALES.

## 5. Siguiente tarea recomendada

1. Configurar credenciales Culqi reales o sandbox.
2. Probar creación de token desde Culqi Checkout.
3. Probar creación de cargo real en backend.
4. Probar creación de orden Culqi para billeteras móviles/QR.
5. Probar matrícula automática luego de pago confirmado.
6. Probar flujo completo con usuario STUDENT.

## 6. Pendientes principales

- Prueba end to end con Culqi real o sandbox.
- Historial visual de intentos.
- Corrección manual de respuestas `SHORT_ANSWER`.
- Entregas de texto y archivos en frontend.
- Comprobantes internos.
- Pruebas automatizadas.
- OpenAPI/Swagger completo.
- Deployment productivo.
- CI/CD.

## 7. Decisiones recientes

- El frontend oficial actual es Next.js, no Angular.
- Los estados de curso se normalizaron a `DRAFT`, `PUBLISHED` y
  `ARCHIVED`, con restricción física en base de datos mediante Flyway V25.
- Los recursos del estudiante se muestran dentro de sus lecciones.
- No existe una pestaña general de recursos.
- Las evaluaciones aparecen dentro del contenido y también tienen ruta independiente.
- No se usan `eslint-disable`.
- Se limpia `.next` al eliminar rutas para evitar validadores generados obsoletos.

## 8. Validaciones recientes

Frontend:

- ESLint correcto.
- Build correcto después de implementar `/student/catalog`.
- Checkout mínimo crea pago `PENDING` desde el catálogo.
- Culqi Checkout integrado en el catálogo para tokenizar el pago.

Backend:

- Catálogo del estudiante compilado.
- Matrícula gratuita del catálogo validada con `mvn clean package -DskipTests`.
- Creación de pagos protegida para cursos `PUBLISHED` y `PAID`.
- Confirmación de pagos protegida por verificación backend contra Culqi.
- Creación de cargo Culqi validada con `mvn clean package -DskipTests`.
- Órdenes Culqi para billeteras móviles/QR validadas con `mvn clean package -DskipTests`.
- Frontend de Culqi con billetera validado con `npm run lint` y `npm run build`.
- Vista administrativa de ingresos y previsualización de comisión Culqi
  validadas con `mvn clean package -DskipTests`, `npm run lint` y
  `npm run build`.
- Configuración persistente del porcentaje Culqi en `system_settings`
  mediante Flyway V28 validada con `mvn clean package -DskipTests`,
  `npm run lint` y `npm run build`.
- Simplificación de comisión Culqi mediante Flyway V29: el administrador
  maneja un único porcentaje de pasarela con valor inicial `4.02%`,
  sin campo visible de IGV en creación o edición de cursos.
- Feedback de inicio de sesión validado con `npm run lint` y
  `npm run build`.
- Precio público final del catálogo de estudiante validado con
  `mvn clean package -DskipTests`, `npm run lint` y `npm run build`.
- Normalización de nombres de usuario mediante Flyway V30 validada con
  `mvn clean package -DskipTests`, `npm run lint` y `npm run build`.
- Verificación de disponibilidad de correo en creación administrativa
  de usuarios validada con `mvn clean package -DskipTests`,
  `npm run lint` y `npm run build`.
- Registro público de estudiantes validado con
  `mvn clean package -DskipTests`, `npm run lint` y `npm run build`.
- Dashboard del estudiante convertido en vista resumen con módulos de
  detalle `/student/certificates` y `/student/payments`, validado con
  `npm run lint` y `npm run build`.
- Resumen de progreso absorbido en `/student/courses` para evitar un
  módulo duplicado de cursos, validado con `npm run lint` y
  `npm run build`.
- Detalle de pagos del estudiante validado con
  `mvn clean package -DskipTests`, `npm run lint` y `npm run build`.
- Centro global de evaluaciones del estudiante validado con
  `mvn clean package -DskipTests`, `npm run lint` y `npm run build`.
- Perfil de cuenta `/account` para admin, instructor y estudiante con
  actualización de datos personales y cambio de contraseña validado con
  `mvn clean package -DskipTests`, `npm run lint` y `npm run build`.
- Acceso visual a `/account` movido desde el menú principal hacia la
  tarjeta inferior del usuario mediante icono de configuración, validado
  con `npm run lint` y `npm run build`.
- Pantalla `/account` redistribuida con encabezado de identidad, edición
  de perfil, seguridad y resumen de privacidad, validada con
  `npm run lint` y `npm run build`.
- Pantalla `/account` ajustada a perfil académico de solo lectura:
  nombres, apellidos y correo no se editan desde el usuario, se eliminó
  el identificador interno visible y se conserva solo cambio de contraseña,
  validado con `npm run lint` y `npm run build`.
- Pantalla `/account` actualizada para permitir cambio de correo del
  usuario con validación de formato y correo único, manteniendo nombres y
  apellidos como datos académicos de solo lectura y quitando la tarjeta
  redundante de correo no modificable, validado con
  `mvn clean package -DskipTests`, `npm run lint` y `npm run build`.
- Cambio de correo en `/account` profesionalizado mediante correo
  bloqueado con acción de edición, OTP enviado al nuevo correo y migración
  Flyway V33 `account_email_change_otps`; al confirmar se entrega un
  access token actualizado, validado con `mvn clean package -DskipTests`,
  `npm run lint` y `npm run build`.
- Validación de cambio de correo ajustada para detectar correos existentes
  sin distinguir mayúsculas/minúsculas, mostrar la advertencia debajo del
  input en lugar de toast duplicado y mapear restricciones de base como
  solicitud inválida, validado con `mvn clean package -DskipTests`,
  `npm run lint` y `npm run build`.
- Certificados PDF con QR de verificación para estudiantes validados con
  `mvn clean package -DskipTests`, `npm run lint` y `npm run build`.
- Plantillas personalizadas de certificado por curso mediante Flyway V34
  `course_certificate_templates`, carga en Cloudinary y generación PDF
  con fondo personalizado, validadas con `mvn clean package -DskipTests`,
  `npm run lint` y `npm run build`.
- Editor visual de coordenadas de certificado por curso validado con
  `mvn clean package -DskipTests`, `npm run lint` y `npm run build`.
- Switches globales de métodos de pago mediante Flyway V36 validados con
  `mvn clean package -DskipTests`, `npm run lint` y `npm run build`.

## 9. Session handoff para Codex

Antes de modificar:

1. Leer `AGENTS.md`.
2. Leer `01_MASTER_PROJECT_SPECIFICATION.md`.
3. Leer este archivo.
4. Leer `03_DATABASE_SCHEMA.md`.
5. Inspeccionar migraciones Flyway.
6. Ejecutar builds de lectura.
7. Comparar documentación con código.

No implementar nada hasta informar inconsistencias y recibir autorización.

## 10. Comandos

Backend:

```powershell
cd novalearn-backend
mvn clean package -DskipTests
```

Frontend:

```powershell
cd novalearn-frontend
npm run lint
npm run build
```
