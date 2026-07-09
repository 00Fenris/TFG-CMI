# TFG-CMI - Cuadro de Mando Integral para restauracion

Proyecto academico y de portfolio desarrollado por **Ignacio Molina Palacios** como Trabajo Fin de Grado en ADE Tecnologico. El objetivo es convertir la estrategia de un negocio HORECA en un sistema de seguimiento operativo con KPIs, objetivos, alertas, tareas y comparacion entre unidades de negocio.

Este repositorio no se presenta como un proyecto de ingenieria pura. Su valor principal esta en la conexion entre **negocio, operaciones, datos, analisis funcional y prototipado digital**.

## Contexto

El proyecto parte de un caso real anonimizado del sector restauracion. La necesidad principal era ordenar la informacion de gestion y traducirla a indicadores accionables para facilitar el seguimiento de objetivos, desviaciones y prioridades operativas.

## Mi aportacion

- Definicion funcional del cuadro de mando: objetivos, perspectivas, KPIs y logica de seguimiento.
- Analisis de procesos de restauracion y necesidades de gestion para dos unidades de negocio.
- Documentacion funcional y preparacion de la defensa academica del proyecto.
- Prototipado web del sistema con apoyo de IA generativa para acelerar la parte tecnica.
- Estructuracion de datos de demostracion anonimizados para poder ensenar el funcionamiento sin exponer informacion real.

## Funcionalidades

- Dashboard de KPIs por restaurante y perspectiva estrategica.
- Mapa estrategico basado en Balanced Scorecard.
- Comparacion entre unidades de negocio.
- Gestion de objetivos, KPIs, tareas y alertas.
- Autenticacion con JWT y roles de usuario.
- Datos de demostracion para ejecucion local.
- Entorno local con Docker Compose.

## Stack

- Frontend: React, React Router, Axios, Recharts.
- Backend: Node.js, Express, Sequelize, JWT, bcrypt.
- Datos: PostgreSQL en Docker y SQLite solo para desarrollo local.
- Entorno: Docker Compose.
- Exploracion IA: Groq SDK y escenarios de asistencia/alertas.

## Estructura

```text
backend/   API Express, modelos Sequelize, rutas, controladores y seed data
frontend/  Aplicacion React con login, dashboard, mapa estrategico y comparativas
etl/       Scripts auxiliares para flujos de datos
```

## Demo local

Requisitos:

- Docker Desktop
- Node.js si se ejecutan backend/frontend fuera de Docker

Arranque:

```bash
docker compose up --build
```

Servicios por defecto:

- API: `http://localhost:4000`
- Frontend: `http://localhost:3000`

Usuarios de demostracion:

- `admin@demo.local`
- `manager.a@demo.local`
- `manager.b@demo.local`

Contrasena de demo:

- `password`

Prueba rapida de login:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.local","password":"password"}' \
  http://localhost:4000/auth/login
```

## Estado del repositorio

Repositorio preparado como muestra de portfolio. Los datos son anonimizados o de demostracion. La documentacion academica completa, notas internas, documentos privados y bases de datos locales quedan fuera del repositorio publico.
