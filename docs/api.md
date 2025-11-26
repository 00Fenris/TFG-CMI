# API Endpoints

Base URL: http://localhost:4000

Auth
- POST /auth/login
  - body: { email, password }
  - response: { token }

Restaurants
- GET /restaurants
  - response: [{ id, name, city, address, status }]
- POST /restaurants (admin)
  - body: { name, city, address, status }

Perspectives
- GET /perspectives
- POST /perspectives (admin)

Objectives
- GET /objectives?restaurant_id=1
- POST /objectives (admin)
- PUT /objectives/:id (admin)

KPIs
- GET /kpis?restaurant_id=1
- GET /kpis/:id  // includes entries
- POST /kpis (admin)
- PUT /kpis/:id (admin)
- GET /kpis/export?restaurant_id=1 (CSV export)

KPI entries
- GET /kpi-entries/kpi/:kpiId
- POST /kpi-entries  // body: { kpi_id, value, period_start }

Tasks
- GET /tasks
- POST /tasks
- PUT /tasks/:id

Dashboard
- GET /dashboard/restaurant/:restaurantId  // KPIs + entries
- GET /dashboard/global  // per restaurant KPIs

Alerts
- GET /alerts
