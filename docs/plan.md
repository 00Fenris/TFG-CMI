# Plan de desarrollo - Fases

Fase 1 - MVP (entregable demo)
- Crear backend con Express, Sequelize y modelos (Users, Restaurants, Perspectives, Objectives, KPIs, KPIEntries, Tasks, KpiAlerts).
- Implementar autenticación JWT y roles (admin/manager).
- Añadir seed de datos para demo (3 restaurantes, 3 usuarios, KPIs).
- Implementar endpoints principales: auth, restaurants, perspectives, objectives, kpis, kpi-entries, dashboard, alerts, tasks.
- Frontend mínimo con Login, Dashboard, KPIs y KPI detail + gráfico.
- Export CSV y PDF (CSV por ahora) - básico.

Fase 2 - Producción y cobertura
- Añadir tests (unitarios y de integración) para endpoints clave.
- Añadir validación y pruebas de seguridad (input sanitization, rate limiting).
- Integración continua: GitHub Actions para tests, linting y despliegue.

Fase 3 - UX y mejoras funcionales
- Mejor UI/UX con componentes reutilizables, formularios y accesibilidad.
- Export a Excel/PDF con formatos corporativos.
- Permisos y logs de auditoría.

Fase 4 - Reporting avanzado y KPI automation
- Automatización: ingest de datos desde TPV y SCRs, pipeline de ETL.
- Alertas en tiempo real (WebSockets / push notifications), envío de email y logs.
- Dashboard avanzado con análisis y predicción simple (flag para data-science).
