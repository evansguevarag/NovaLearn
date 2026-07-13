# AGENTS.md — NovaLearn

## 1. Lectura obligatoria

Antes de modificar cualquier archivo:

1. Lee `01_MASTER_PROJECT_SPECIFICATION.md`.
2. Lee `02_PROJECT_STATUS.md`.
3. Lee `03_DATABASE_SCHEMA.md`.
4. Inspecciona las migraciones Flyway.
5. Inspecciona el código relacionado con la tarea.
6. Ejecuta validaciones iniciales sin modificar archivos.
7. Informa el estado encontrado y espera autorización cuando el usuario lo solicite.

## 2. Prioridad de fuentes

1. Migraciones Flyway.
2. `03_DATABASE_SCHEMA.md`.
3. `02_PROJECT_STATUS.md`.
4. `01_MASTER_PROJECT_SPECIFICATION.md`.
5. Código existente.

Cuando exista contradicción, no adivines. Informa la diferencia y propone cómo sincronizarla.

## 3. Estructura

```text
NovaLearn/
├── novalearn-backend/
├── novalearn-frontend/
├── AGENTS.md
├── 01_MASTER_PROJECT_SPECIFICATION.md
├── 02_PROJECT_STATUS.md
└── 03_DATABASE_SCHEMA.md
```

## 4. Backend

- Java 21.
- Spring Boot 3.5.x.
- Maven.
- PostgreSQL.
- Flyway.
- Spring Security.
- JWT y Refresh Tokens.
- Arquitectura monolítica modular.
- Capas: controller, service, repository, entity y DTO.

Reglas:

- No exponer entidades directamente.
- No omitir validaciones de rol y ownership.
- No modificar migraciones ya aplicadas.
- No crear una tabla o columna sin migración.
- No duplicar endpoints o servicios.
- Usar transacciones donde corresponda.
- Mantener soft delete.
- Usar el usuario autenticado en operaciones del estudiante.

Validación:

```powershell
cd novalearn-backend
mvn clean package -DskipTests
```

## 5. Frontend

- Next.js 16.
- React.
- TypeScript.
- Tailwind CSS.
- App Router.

Reglas:

- No usar `eslint-disable`.
- No usar `any` salvo justificación explícita.
- No ocultar errores TypeScript.
- No duplicar servicios API.
- Reutilizar componentes UI existentes.
- Respetar rutas y guards por rol.
- No usar datos mock en flujos finales.
- Limpiar `.next` si se elimina o renombra una ruta.

Validación:

```powershell
cd novalearn-frontend
npm run lint
npm run build
```

## 6. Git

- No trabajar directamente en `main`.
- Usar `dev` como integración.
- Crear ramas `feature/*`.
- Mostrar `git diff` antes de confirmar.
- No hacer commit ni push sin autorización explícita.
- No sobrescribir cambios del usuario.

## 7. Método de trabajo

Para cada tarea:

1. Analizar.
2. Localizar archivos reales.
3. Proponer plan corto.
4. Implementar el cambio mínimo.
5. Ejecutar validaciones.
6. Mostrar archivos modificados.
7. Explicar resultado y pendientes.
8. Actualizar `02_PROJECT_STATUS.md` cuando la tarea quede validada.
9. Actualizar `03_DATABASE_SCHEMA.md` si cambia la base.

## 8. Seguridad

- Nunca imprimir secretos.
- No guardar claves en el repositorio.
- Usar variables de entorno.
- No desactivar Spring Security.
- No confiar en validaciones frontend.
- No procesar pagos como exitosos sin confirmación confiable del proveedor.

## 9. Estado actual

Lee `02_PROJECT_STATUS.md`.

La próxima tarea inmediata es confirmar la matrícula gratuita del catálogo y luego implementar el frontend del catálogo del estudiante.

## 10. Prohibiciones

- No ejecutar cambios masivos sin revisar.
- No borrar módulos sin verificar referencias.
- No reescribir arquitectura completa por conveniencia.
- No introducir una tecnología distinta sin autorización.
- No afirmar que una tarea terminó si build, lint o pruebas fallan.
