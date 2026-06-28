-- SQL schema para Cuadro de Mando Integral - Grupo HORECA Demo
-- PostgreSQL

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(512) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'manager', -- admin | manager
  restaurant_id BIGINT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  city VARCHAR(100),
  address TEXT,
  status VARCHAR(50) DEFAULT 'open', -- open|closed|opening
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Perspectives
CREATE TABLE IF NOT EXISTS perspectives (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Objectives
CREATE TABLE IF NOT EXISTS objectives (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(400) NOT NULL,
  description TEXT,
  perspective_id BIGINT NOT NULL REFERENCES perspectives(id) ON DELETE CASCADE,
  restaurant_id BIGINT NULL REFERENCES restaurants(id) ON DELETE SET NULL,
  owner_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active', -- active|paused|closed
  due_date DATE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- KPIs
CREATE TABLE IF NOT EXISTS kpis (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(400) NOT NULL,
  description TEXT,
  formula TEXT,
  frequency VARCHAR(50) NOT NULL DEFAULT 'monthly', -- daily|weekly|monthly
  unit VARCHAR(50) DEFAULT 'number', -- %, currency, number
  current_value NUMERIC(14,4),
  target_value NUMERIC(14,4),
  alert_condition VARCHAR(10) DEFAULT 'below', -- below|above
  alert_threshold NUMERIC(14,4), -- if present, triggers alert when condition met vs target_value
  owner_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  objective_id BIGINT NULL REFERENCES objectives(id) ON DELETE SET NULL,
  restaurant_id BIGINT NULL REFERENCES restaurants(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- KPI historical entries
CREATE TABLE IF NOT EXISTS kpi_entries (
  id BIGSERIAL PRIMARY KEY,
  kpi_id BIGINT NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  recorded_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  value NUMERIC(14,4) NOT NULL,
  period_start DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(400) NOT NULL,
  description TEXT,
  owner_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  assigned_to BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  objective_id BIGINT NULL REFERENCES objectives(id) ON DELETE SET NULL,
  kpi_id BIGINT NULL REFERENCES kpis(id) ON DELETE SET NULL,
  due_date DATE NULL,
  status VARCHAR(50) DEFAULT 'todo', -- todo|in-progress|done|blocked
  priority VARCHAR(20) DEFAULT 'normal', -- low|normal|high
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Alerts log (when KPI underperformance is detected)
CREATE TABLE IF NOT EXISTS kpi_alerts (
  id BIGSERIAL PRIMARY KEY,
  kpi_id BIGINT NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  recorded_value NUMERIC(14,4) NOT NULL,
  target_value NUMERIC(14,4) NULL,
  threshold NUMERIC(14,4) NULL,
  condition VARCHAR(10) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_kpis_objective ON kpis(objective_id);
CREATE INDEX IF NOT EXISTS idx_kpis_restaurant ON kpis(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_kpi_entries_kpi_period ON kpi_entries(kpi_id, period_start);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_perspectives_updated_at BEFORE UPDATE ON perspectives FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_objectives_updated_at BEFORE UPDATE ON objectives FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_kpis_updated_at BEFORE UPDATE ON kpis FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Sample seed data
INSERT INTO restaurants (name, city, address, status)
VALUES
  ('Grupo HORECA Demo - Salamanca', 'Salamanca', 'Direccion demo A', 'open'),
  ('Grupo HORECA Demo - Zamora', 'Zamora', 'Direccion demo B', 'open'),
  ('Grupo HORECA Demo - Tercer Restaurante', 'En apertura', 'TBD', 'opening')
ON CONFLICT DO NOTHING;

-- Perspectives: Financiera, Clientes, Procesos internos, Aprendizaje y crecimiento
INSERT INTO perspectives (name, description) VALUES
  ('Financiera', 'Objetivos financieros: ingresos, costes, margen'),
  ('Clientes', 'Satisfacción, fidelización, ticket medio'),
  ('Procesos internos', 'Eficiencia operativa, tiempos, desperdicio'),
  ('Aprendizaje y crecimiento', 'Formación del personal, rotación, clima laboral')
ON CONFLICT DO NOTHING;

-- Example users -- NOTE: Replace with proper hashed passwords via seed script
INSERT INTO users (name, email, password_hash, role, restaurant_id)
VALUES
  ('Admin Demo', 'admin@demo.local', gen_random_uuid()::text, 'admin', NULL),
  ('Manager Salamanca', 'manager.a@demo.local', gen_random_uuid()::text, 'manager', 1),
  ('Manager Zamora', 'manager.b@demo.local', gen_random_uuid()::text, 'manager', 2)
ON CONFLICT DO NOTHING;

-- Add example objectives
INSERT INTO objectives (title, description, perspective_id, restaurant_id, owner_id)
VALUES
  ('Aumentar ventas mensuales', 'Incrementar las ventas en un 10% en Salamanca', 1, 1, 2),
  ('Mejorar satisfacción del cliente', 'Aumentar NPS por encima de 80', 2, NULL, 2),
  ('Reducir desperdicio de alimentos', 'Optimizar compras y preparación para reducir el waste', 3, 1, 2)
ON CONFLICT DO NOTHING;

-- Example KPIs
INSERT INTO kpis (name, description, formula, frequency, unit, current_value, target_value, alert_condition, alert_threshold, owner_id, objective_id, restaurant_id)
VALUES
  ('Ingresos Mensuales', 'Ingresos totales por mes', 'SUM(ventas)', 'monthly', 'currency', 30000, 33000, 'below', 0.95, 2, 1, 1),
  ('Ticket Medio', 'Promedio de ticket por cliente', 'SUM(importe)/COUNT(tickets)', 'monthly', 'currency', 20.5, 22.5, 'below', 0.95, 2, 1, 1),
  ('Satisfacción (NPS)', 'Net Promoter Score', 'Survey NPS', 'monthly', 'number', 78, 85, 'below', 0.95, 2, 2, NULL),
  ('Coste de Alimentos %', 'Food Cost % = Coste alimentos / Ventas', 'CosteAlim/Ventas', 'monthly', 'percent', 28, 25, 'above', 1.05, 2, 3, 1)
ON CONFLICT DO NOTHING;

-- Example KPI entries (history)
INSERT INTO kpi_entries (kpi_id, recorded_by, value, period_start, note) VALUES
  (1, 2, 29500, '2025-10-01', 'Octubre: promoción semanal'),
  (1, 2, 32000, '2025-11-01', 'Noviembre: inicio campaña'),
  (3, 2, 78, '2025-11-01', 'NPS encuesta digital')
ON CONFLICT DO NOTHING;

-- Example tasks
INSERT INTO tasks (title, description, owner_id, assigned_to, objective_id, due_date, status, priority)
VALUES
  ('Campaña marketing noviembre', 'Campaña para incrementar ventas en Salamanca', 2, 2, 1, '2025-11-30', 'in-progress', 'high'),
  ('Formación de atención al cliente', 'Entrenamiento en trato y experiencia', 2, 2, 2, '2025-12-15', 'todo', 'normal')
ON CONFLICT DO NOTHING;

-- Done
