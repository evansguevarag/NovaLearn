# NovaLearn — Database Schema

Última actualización: 2026-07-04

## 1. Fuente de verdad

Las migraciones Flyway ubicadas en:

```text
novalearn-backend/src/main/resources/db/migration
```

son la fuente física definitiva del esquema.

Este documento resume el contrato de datos. Ante una diferencia, Codex debe inspeccionar las migraciones aplicadas y actualizar este documento; nunca debe editar una migración ya aplicada.

## 2. Convenciones

- PostgreSQL.
- Nombres `snake_case`.
- PK `BIGINT`.
- Fechas `TIMESTAMP`.
- Soft delete mediante `deleted_at`.
- Auditoría mediante `created_at` y `updated_at`.
- Restricciones únicas en relaciones que no admiten duplicados.

## 3. Core y seguridad

Tablas principales:

- `users`
- `auth_login_otps`
- `auth_password_reset_otps`
- `account_email_change_otps`
- `user_settings`
- `refresh_tokens`
- `file_assets`
- `notifications`
- `system_settings`
- `audit_logs`

Enums principales:

- `user_role`: `ADMIN`, `INSTRUCTOR`, `STUDENT`
- `user_status`: `ACTIVE`, `INACTIVE`

### users

Campos relevantes de nombre:

```text
first_name
last_name
paternal_last_name
maternal_last_name
```

Regla:

- `first_name` almacena los nombres completos.
- `paternal_last_name` almacena el apellido paterno.
- `maternal_last_name` almacena el apellido materno.
- `last_name` se mantiene como apellido completo combinado para
  compatibilidad con pantallas y contratos existentes.
- V30 agrega `paternal_last_name` y `maternal_last_name`, y migra datos
  existentes desde `last_name` de forma conservadora.

### auth_login_otps

Tabla agregada por V31 para el inicio de sesión en dos pasos con OTP por
correo.

Campos relevantes:

```text
challenge_id
user_id
code_hash
expires_at
consumed_at
attempts
created_at
```

Regla:

- El código OTP nunca se guarda en texto plano; se almacena hasheado.
- Cada desafío tiene expiración corta y se consume al iniciar sesión.
- Los intentos fallidos se contabilizan para bloquear el desafío tras
  varios errores.

### auth_password_reset_otps

Tabla agregada por V32 para recuperación de contraseña mediante OTP por
correo.

Campos relevantes:

```text
challenge_id
user_id
code_hash
expires_at
consumed_at
attempts
created_at
```

Regla:

- El código de recuperación nunca se guarda en texto plano; se almacena
  hasheado.
- Cada desafío vence y se consume cuando la contraseña se actualiza.
- Al completar el cambio se revocan las sesiones renovables activas del
  usuario.

### account_email_change_otps

Tabla agregada por V33 para confirmar cambios de correo desde `/account`
mediante OTP enviado al correo nuevo.

Campos relevantes:

```text
challenge_id
user_id
new_email
code_hash
expires_at
consumed_at
attempts
created_at
```

Regla:

- El correo solo cambia después de validar el código OTP.
- El código nunca se guarda en texto plano; se almacena hasheado.
- Cada desafío vence, se consume al confirmar y registra intentos fallidos.
- Al confirmar se emite un nuevo access token porque el JWT usa el correo
  como subject.

### system_settings

Campos relevantes para pagos:

```text
payment_processing_fee_percentage
payment_processing_fee_tax_percentage
pass_processing_fee_to_student
culqi_payments_enabled
manual_payments_enabled
```

Regla:

- V28 agrega la configuración persistente del porcentaje Culqi, el IGV
  de esa comisión y si la comisión se suma al precio final del estudiante.
- V29 simplifica el modelo operativo para administración: el porcentaje
  visible de pasarela inicia en `4.02%` y el IGV de comisión queda en
  `0` para no exponer ni aplicar un segundo porcentaje al crear pagos.
- V36 agrega switches globales para habilitar o deshabilitar pagos por
  Culqi y pagos manuales. Al menos un método debe quedar activo.

## 4. Cursos y aprendizaje

Tablas principales:

- `course_categories`
- `courses`
- `course_modules`
- `lessons`
- `enrollments`
- `lesson_progress`
- `course_reviews`
- `course_wishlist`
- `certificates`
- `course_certificate_templates`

### courses

Campos conceptuales:

```text
id
instructor_id
category_id
title
slug
short_description
description
requirements
target_audience
thumbnail_url
price
course_type
status
level
certificate_enabled
published_at
created_at
updated_at
deleted_at
```

Enums:

```text
course_type: FREE, PAID
course_status: DRAFT, PUBLISHED, ARCHIVED
```

### enrollments

Campos actuales relevantes:

```text
id
student_id
course_id
enrolled_at
completed_at
progress_percentage
is_active
created_at
updated_at
deleted_at
```

Restricción:

```text
UNIQUE(student_id, course_id)
```

Regla de reactivación:

- una matrícula eliminada se reutiliza;
- `deleted_at` vuelve a `NULL`;
- `is_active` vuelve a `TRUE`;
- progreso vuelve a cero;
- `completed_at` vuelve a `NULL`;
- se actualiza `enrolled_at`.

### course_certificate_templates

Tabla agregada por V34 para permitir plantillas personalizadas de
certificados por curso.

Campos relevantes:

```text
course_id
template_url
template_public_id
template_resource_type
student_name_x
student_name_y
course_title_x
course_title_y
issued_at_x
issued_at_y
certificate_code_x
certificate_code_y
qr_x
qr_y
primary_text_color
active
created_at
updated_at
```

Restricción:

```text
UNIQUE(course_id)
```

Regla:

- cada curso puede tener una plantilla activa de certificado;
- `template_url` apunta a la imagen subida a Cloudinary;
- las coordenadas se guardan como porcentajes y se actualizan desde el
  editor visual de plantilla en frontend;
- si un curso no tiene plantilla, se usa el certificado NovaLearn por
  defecto;
- el QR de verificación se mantiene obligatorio en el PDF generado.

## 5. Contenido y recursos

Las lecciones pueden representar video, texto, quiz o recurso según las migraciones y enums actuales.

Los recursos no forman un módulo general para el estudiante. Se acceden mediante una lección y sus asociaciones de archivos.

Codex debe inspeccionar las migraciones para obtener los nombres físicos exactos de tablas de archivos y asociaciones.

## 6. Evaluaciones

Migraciones conocidas:

- V20: motor base de evaluaciones e intentos.
- V21: modalidades de entrega y archivos.

Tablas confirmadas:

- `evaluations`
- `evaluation_questions`
- `evaluation_options`
- `evaluation_attempts`
- `evaluation_attempt_answers`
- `evaluation_answer_options`
- tablas de submissions y attachments introducidas por V21

Enums conceptuales:

```text
evaluation_type:
QUIZ
PRACTICE
MIDTERM
FINAL_EXAM
```

```text
evaluation_status:
DRAFT
PUBLISHED
CLOSED
```

```text
delivery_mode:
ONLINE_QUIZ
TEXT_SUBMISSION
FILE_SUBMISSION
HYBRID
```

```text
question_type:
SINGLE_CHOICE
MULTIPLE_CHOICE
TRUE_FALSE
SHORT_ANSWER
```

Los nombres exactos de enums PostgreSQL y columnas deben leerse de V20 y V21.

## 7. Pagos

Tablas principales implementadas:

- `payments`
- `payment_transactions`

Conceptos:

```text
student_id
course_id
amount
subtotal_amount
processing_fee_amount
tax_amount
total_amount
currency
status
provider
provider_payment_id
provider_order_id
provider_order_status
provider_order_expires_at
manual_method
manual_reference
manual_proof_url
manual_proof_public_id
manual_proof_resource_type
manual_reviewed_by
manual_reviewed_at
manual_rejection_reason
paid_at
created_at
updated_at
```

Estados:

```text
PENDING
PROCESSING
PAID
FAILED
CANCELLED
REJECTED
REFUNDED
```

Proveedores:

```text
CULQI
MANUAL
```

Regla:

- solo un pago confirmado como exitoso debe habilitar la matrícula en cursos pagados.
- `provider_order_id` almacena la orden Culqi usada por billeteras móviles/QR.
- los pagos manuales quedan `PENDING` hasta revisión administrativa.
- un pago manual aprobado pasa a `PAID` y habilita matrícula mediante la
  misma regla de confirmación que Culqi.
- un pago manual rechazado queda `REJECTED` con motivo visible para el
  estudiante.
- los comprobantes manuales se almacenan en Cloudinary y se referencian
  desde `manual_proof_url`.
- V22 agrega `payments.provider_order_id` y su índice.
- V23 agrega `payments.provider_order_status` y
  `payments.provider_order_expires_at` para decidir si una orden Culqi
  puede reutilizarse antes de abrir el Checkout.
- V26 agrega `payments.paid_at` para registrar la fecha real de
  confirmación del pago y listar ingresos individuales.
- V27 agrega `payments.subtotal_amount`,
  `payments.processing_fee_amount`, `payments.tax_amount` y
  `payments.total_amount` para conservar el desglose del precio del
  curso, la comisión de procesamiento, su IGV y el total cobrado.
- V35 agrega metadatos de revisión de pagos manuales:
  `manual_method`, `manual_reference`, `manual_proof_url`,
  `manual_proof_public_id`, `manual_proof_resource_type`,
  `manual_reviewed_by`, `manual_reviewed_at` y
  `manual_rejection_reason`.
- La comisión aplicada al crear pagos se lee desde `system_settings`
  cuando existe configuración persistida; si no existe, se usan las
  variables de entorno de Culqi como respaldo. Si no hay porcentaje
  configurado, el backend usa `4.02%` como valor inicial.

## 8. Integridad

- No crear una segunda matrícula para el mismo estudiante y curso.
- No permitir acceso a contenido sin matrícula activa.
- No permitir matrícula gratuita para cursos `PAID`.
- No mostrar cursos no publicados en catálogo.
- No duplicar intentos fuera de las reglas de `max_attempts`.
- Las respuestas objetivas pueden calificarse automáticamente.
- Las respuestas cortas deben admitir calificación manual.

## 9. Procedimiento para cambios

Antes de cambiar el esquema:

1. Inspeccionar la última migración.
2. Elegir el siguiente número disponible.
3. Crear una migración nueva.
4. Actualizar entidades y DTO.
5. Compilar backend.
6. Ejecutar migración en base local.
7. Actualizar este documento.
8. Actualizar `02_PROJECT_STATUS.md`.

## 10. Verificación obligatoria para Codex

Codex debe ejecutar:

```powershell
Get-ChildItem novalearn-backend/src/main/resources/db/migration
```

y comparar todas las migraciones con este resumen antes de proponer cambios de base de datos.
