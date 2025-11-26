# Arquitectura del proyecto

Estructura principal:

- backend/
  - src/
    - controllers/    // Lógica de negocio (CRUD para KPIs, objectives, etc.)
    - models/         // Sequelize models (User, Kpi, Objective, Task, KpiEntry, ...) y fallback in-memory
    - routes/         // Rutas Express que exponen los endpoints
    - middleware/     // Autenticación JWT y roles
    - seed.js         // Script para crear datos demo (seed automático en `SEED_DB=true`)
  - db/               // Esquema SQL de referencia

- frontend/
  - public/           // index.html
  - src/              // React components y páginas (Login, Dashboard, KpiDetail)
  - lib/api.js        // wrapper axios con baseURL y autorización

- docker-compose.yml  // Orquestación Docker para Postgres, backend y frontend

La aplicación está diseñada para ser desplegada con Docker (ver README). Para demos rápidas, el backend incluye un 'fallback' in-memory si no se puede conectar a DB/Postgres.
