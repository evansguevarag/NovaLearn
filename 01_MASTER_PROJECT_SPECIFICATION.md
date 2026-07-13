# NovaLearn — Master Project Specification

Última actualización: 2026-06-26

## 1. Propósito

NovaLearn es una plataforma LMS preparada para evolucionar hacia un marketplace multi-instructor. Permite administrar usuarios, cursos, contenido, evaluaciones, progreso, pagos, certificados, notificaciones y auditoría.

## 2. Fuentes de verdad

El orden de prioridad es:

1. Migraciones Flyway en `novalearn-backend/src/main/resources/db/migration`.
2. `03_DATABASE_SCHEMA.md`.
3. `02_PROJECT_STATUS.md`.
4. Este documento.
5. Código existente.

No se debe modificar una migración ya aplicada. Todo cambio físico de base de datos requiere una nueva migración.

## 3. Arquitectura oficial

### Repositorio

```text
NovaLearn/
├── AGENTS.md
├── 01_MASTER_PROJECT_SPECIFICATION.md
├── 02_PROJECT_STATUS.md
├── 03_DATABASE_SCHEMA.md
├── novalearn-backend/
└── novalearn-frontend/
```

### Backend

- Java 21.
- Spring Boot 3.5.x.
- Spring Security.
- JWT Access Token y Refresh Token.
- Spring Data JPA e Hibernate.
- PostgreSQL.
- Flyway.
- Maven.
- Arquitectura monolítica modular.
- Capas: controller, service, repository, entity y DTO.
- Integraciones previstas o implementadas: Cloudinary, Resend y Culqi.

### Frontend

La implementación real actual usa:

- Next.js 16.
- React.
- TypeScript.
- Tailwind CSS.
- Componentes UI reutilizables.
- App Router.
- Axios mediante cliente API centralizado.
- Protección de rutas por rol.

La referencia antigua a Angular ya no aplica al repositorio actual.

## 4. Roles

### ADMIN

Gestiona usuarios, categorías, cursos, estados, pagos, reportes y configuración global.

### INSTRUCTOR

Crea y administra sus cursos, módulos, lecciones, recursos, evaluaciones y estudiantes inscritos.

### STUDENT

Consulta el catálogo, se matricula, compra cursos, consume contenido, responde evaluaciones y consulta su progreso.

## 5. Reglas arquitectónicas

- No usar datos simulados en funcionalidades finales.
- No hardcodear usuarios, roles, permisos, tokens o secretos.
- Toda autorización crítica se valida en backend.
- El frontend no es una barrera de seguridad.
- Toda exposición de entidades se realiza mediante DTO.
- No usar `eslint-disable`.
- No ocultar errores de TypeScript.
- No duplicar endpoints, servicios, componentes o modelos existentes.
- No modificar migraciones Flyway aplicadas.
- Antes de implementar, revisar la funcionalidad y rutas existentes.
- Los cursos eliminados y otros registros críticos usan soft delete.
- Las operaciones críticas deben registrarse en auditoría cuando el módulo lo soporte.

## 6. Módulos actuales

### Core

- Usuarios.
- Autenticación.
- Configuración personal.
- Refresh tokens.
- Notificaciones.
- Auditoría.
- Configuración del sistema.

### Learning

- Categorías.
- Cursos.
- Módulos.
- Lecciones.
- Recursos por lección.
- Progreso.
- Inscripciones.
- Evaluaciones.
- Preguntas y opciones.
- Intentos y respuestas.
- Entregas de texto o archivo.
- Reseñas.
- Wishlist.
- Certificados.

### Commerce

- Pagos.
- Transacciones de pago.
- Preparación para Culqi.
- Matrícula automática luego de pago confirmado.
- Historial de pagos.

## 7. Cursos

Estados:

- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

Tipos:

- `FREE`
- `PAID`

Reglas:

- Solo cursos `PUBLISHED` aparecen en el catálogo.
- Un curso `FREE` permite matrícula directa.
- Un curso `PAID` requiere el flujo de pago.
- Solo estudiantes matriculados acceden al contenido.
- Un instructor solo administra cursos propios, salvo permisos administrativos.

## 8. Contenido del curso

Jerarquía:

```text
Curso
└── Módulo
    ├── Lección de video
    ├── Lección de texto
    ├── Lección de recurso
    └── Evaluación
```

Los recursos pertenecen a una lección. No existe un módulo general independiente de recursos para el estudiante.

## 9. Evaluaciones

Tipos:

- `QUIZ`
- `PRACTICE`
- `MIDTERM`
- `FINAL_EXAM`

Modalidades:

- `ONLINE_QUIZ`
- `TEXT_SUBMISSION`
- `FILE_SUBMISSION`
- `HYBRID`

Estados:

- `DRAFT`
- `PUBLISHED`
- `CLOSED`

Tipos de pregunta:

- `SINGLE_CHOICE`
- `MULTIPLE_CHOICE`
- `TRUE_FALSE`
- `SHORT_ANSWER`

Reglas:

- Las preguntas objetivas se califican automáticamente.
- `SHORT_ANSWER` requiere revisión manual.
- Se controlan intentos máximos, disponibilidad, vencimiento y puntaje aprobatorio.
- El estudiante puede iniciar, guardar, reanudar y enviar un intento.

## 10. Catálogo e inscripciones

El catálogo del estudiante debe:

- listar cursos publicados;
- buscar por texto;
- filtrar por categoría, tipo, nivel y precio;
- indicar si el estudiante ya está matriculado;
- mostrar `Inscribirme gratis`, `Comprar curso` o `Ver curso`.

La matrícula gratuita:

- usa al estudiante autenticado;
- solo acepta cursos `PUBLISHED` y `FREE`;
- impide duplicados;
- puede reactivar una matrícula eliminada;
- reinicia progreso al reactivar.

## 11. Pagos

- Moneda: PEN.
- Proveedor previsto: Culqi.
- Estados principales: `PENDING`, `PROCESSING`, `PAID`, `FAILED`, `CANCELLED`.
- Un pago aprobado genera o confirma la matrícula.
- NovaLearn no almacena datos sensibles de tarjeta.

## 12. Validaciones obligatorias

Backend:

```powershell
mvn clean package -DskipTests
```

Frontend:

```powershell
npm run lint
npm run build
```

Una tarea no está terminada si alguna validación falla.

## 13. Flujo Git

- `main`: estable.
- `dev`: integración.
- `feature/*`: funcionalidades.
- No trabajar directamente sobre `main`.
- Revisar `git diff` antes del commit.
- Commits pequeños y descriptivos.
