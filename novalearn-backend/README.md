# NovaLearn Backend

Backend REST API para NovaLearn, una plataforma LMS desarrollada con Java 21, Spring Boot, PostgreSQL, Flyway, Spring Security, JWT, Cloudinary y Resend.

## Tecnologías principales

- Java 21
- Spring Boot 3
- Spring Security
- JWT + Refresh Tokens
- PostgreSQL
- Flyway
- Maven
- Cloudinary
- Resend
- Swagger / OpenAPI

## Módulos implementados

### Autenticación

- Registro de usuarios
- Login
- Refresh Token
- Logout
- JWT Authentication
- Roles: ADMIN, INSTRUCTOR, STUDENT

### Usuarios

- Perfil del usuario autenticado
- Actualización de datos personales
- Cambio de contraseña
- Gestión de roles

### Cursos

- Categorías de cursos
- Cursos
- Módulos
- Lecciones
- Subida de imágenes con Cloudinary
- Marketplace público
- Búsqueda avanzada

### Matrículas

- Inscripción de estudiantes
- Listado por curso
- Listado por estudiante
- Progreso de lecciones

### Quizzes

- Preguntas
- Opciones
- Intentos
- Calificación automática

### Certificados

- Generación de certificados
- Consulta por matrícula
- Consulta pública por código

### Pagos

- Creación de pago interno
- Confirmación simulada
- Matrícula automática al confirmar pago
- Registro de transacciones

### Emails

- Integración con Resend
- Email de prueba
- Emails automáticos en registro, pago y certificado

### Reviews

- Valoraciones de cursos
- Comentarios
- Consulta pública
- Gestión administrativa

### Wishlist

- Agregar cursos favoritos
- Listar favoritos
- Ver estado de favorito
- Quitar favoritos

### Dashboards

- Dashboard administrativo
- Dashboard del estudiante
- Dashboard del instructor

### Notificaciones

- Notificaciones internas por usuario
- Conteo de no leídas
- Marcar como leída
- Eliminar notificación

### Auditoría

- Registro de acciones importantes
- Consulta por usuario
- Consulta por acción
- Consulta por entidad

---

## Requisitos previos

Antes de ejecutar el proyecto, instala:

- Java 21
- Maven 3.9+
- PostgreSQL 17+
- Git

Verificar versiones:

```bash
java -version
mvn -version
psql --version
git --version

REFRESH_COOKIE_SECURE=true
REFRESH_COOKIE_SAME_SITE=None