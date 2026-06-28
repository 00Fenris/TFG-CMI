# TFG-CMI - Balanced Scorecard for Restaurant Operations

Academic and portfolio project developed by Ignacio Molina Palacios for a real, anonymized HORECA case. The goal is to turn business strategy into an operational monitoring system: objectives, Balanced Scorecard perspectives, KPIs, alerts, tasks and comparison between restaurant units.

## Value Proposition

The project connects business analysis and applied technology. It starts from a functional problem in restaurant operations and translates it into a working web application where management roles can monitor indicators, detect deviations and prioritize actions.

This is not presented as a pure software engineering project. Its main value is the functional bridge between business, operations, data, KPI design and a usable digital prototype.

## Main Features

- KPI dashboard by restaurant and strategic perspective.
- Balanced Scorecard map for business objectives.
- Comparison between restaurant units.
- Objective, KPI entry, task and alert management.
- JWT authentication and role-based access.
- Seed data for local demos.
- Docker Compose setup for backend, frontend and database.

## Tech Stack

- Frontend: React, React Router, Axios, Recharts.
- Backend: Node.js, Express, Sequelize, JWT, bcrypt.
- Data: PostgreSQL in Docker and SQLite for local development.
- Workflow: Docker Compose and Windows desktop build exploration.
- AI exploration: Groq SDK and Telegram bot scenarios for assistance and alerts.

## Project Structure

```text
backend/   Express API, Sequelize models, routes, controllers and seed data
frontend/  React application with login, dashboard, strategic map and comparisons
etl/       Supporting scripts for data workflows
desktop/   Desktop packaging exploration
```

## Local Demo

Requirements:

- Docker Desktop
- Node.js if backend/frontend are run outside Docker

Run the full demo:

```bash
docker compose up --build
```

Default services:

- API: `http://localhost:4000`
- Frontend: `http://localhost:3000`

Demo users:

- `admin@demo.local`
- `manager.a@demo.local`
- `manager.b@demo.local`

Default password:

- `password`

Quick login test:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.local","password":"password"}' \
  http://localhost:4000/auth/login
```

## Academic Context

This repository is part of Ignacio Molina Palacios' final degree project in Business Administration and Management of Technology Companies.

The project demonstrates:

- Strategic analysis translated into actionable KPIs.
- Functional data modeling for restaurant operations.
- Full stack prototyping for a management tool.
- Prioritization of business needs and user experience.
- Documentation and defense of a business-technology solution.

## Privacy Note

The public repository uses an anonymized business case and demo data. Detailed academic documents, real-case notes and local databases are intentionally excluded from the public portfolio version.
