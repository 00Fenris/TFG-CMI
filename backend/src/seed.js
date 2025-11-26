require('dotenv').config();
const bcrypt = require('bcryptjs');
const modelsIndex = require('./models');
const { sequelize, usingSequelize, User, Restaurant, Perspective, Objective, Kpi, KpiEntry, Task } = modelsIndex;
async function seed() {
  async function retry(fn, attempts = 6, delay = 200) {
    for (let i = 0; i < attempts; i++) {
      try { return await fn(); } catch (err) {
        if (i === attempts - 1) throw err;
        console.warn('Retrying after error', err && err.message);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  if (usingSequelize && sequelize) {
    console.log('Syncing DB (force=false)...');
    await retry(() => sequelize.sync(), 6, 200);
    // Avoid seeding if already present
    try {
      const count = await Restaurant.count();
      if (count > 0) {
        console.log('DB already has data; skipping seed.');
        return;
      }
    } catch (err) {
      // ignore and continue
    }
  } else {
    console.log('Using in-memory mock DB; skipping sync');
  }

  const passwordPlain = process.env.SEED_PASSWORD || 'password';
  const passwordHash = bcrypt.hashSync(passwordPlain, 10);

  // Restaurants
  const [salaman, zamora, opening] = await Promise.all([
    retry(() => Restaurant.findOrCreate({ where: { name: 'Claunafood - Salamanca' }, defaults: { city: 'Salamanca', address: 'Calle Feria 10', status: 'open' } })),
    retry(() => Restaurant.findOrCreate({ where: { name: 'Claunafood - Zamora' }, defaults: { city: 'Zamora', address: 'Calle Santa Clara 5', status: 'open' } })),
    retry(() => Restaurant.findOrCreate({ where: { name: 'Claunafood - Tercer Restaurante' }, defaults: { city: 'En apertura', address: 'TBD', status: 'opening' } }))
  ]).then(rows => rows.map(r => Array.isArray(r) ? r[0] : r));

  // Perspectives
  const perspectivesSeed = [
    { name: 'Financiera', description: 'Objetivos financieros: ingresos, costes, margen' },
    { name: 'Clientes', description: 'Satisfacción, fidelización, ticket medio' },
    { name: 'Procesos internos', description: 'Eficiencia operativa, tiempos, desperdicio' },
    { name: 'Aprendizaje y crecimiento', description: 'Formación del personal, rotación, clima laboral' }
  ];
  const perspectives = [];
  for (const p of perspectivesSeed) {
    const model = await retry(() => Perspective.findOrCreate({ where: { name: p.name }, defaults: p }));
    perspectives.push(Array.isArray(model) ? model[0] : model);
  }

  // Users
  const [admin] = await retry(() => User.findOrCreate({ where: { email: 'admin@claunafood.local' }, defaults: { name: 'Admin Clauna', email: 'admin@claunafood.local', password_hash: passwordHash, role: 'admin' } }));
  const [managerSal] = await retry(() => User.findOrCreate({ where: { email: 'manager.salamanca@claunafood.local' }, defaults: { name: 'Manager Salamanca', email: 'manager.salamanca@claunafood.local', password_hash: passwordHash, role: 'manager', restaurant_id: salaman.id } }));
  const [managerZam] = await retry(() => User.findOrCreate({ where: { email: 'manager.zamora@claunafood.local' }, defaults: { name: 'Manager Zamora', email: 'manager.zamora@claunafood.local', password_hash: passwordHash, role: 'manager', restaurant_id: zamora.id } }));

  // Objectives
  const [objSales] = await retry(() => Objective.findOrCreate({ where: { title: 'Aumentar ventas mensuales', restaurant_id: salaman.id }, defaults: { title: 'Aumentar ventas mensuales', description: 'Incrementar las ventas en un 10% en Salamanca', perspective_id: perspectives[0].id, restaurant_id: salaman.id, owner_id: managerSal.id } }));
  const [objSatisfaction] = await retry(() => Objective.findOrCreate({ where: { title: 'Mejorar satisfacción del cliente' }, defaults: { title: 'Mejorar satisfacción del cliente', description: 'Aumentar NPS por encima de 80', perspective_id: perspectives[1].id, restaurant_id: null, owner_id: managerSal.id } }));
  const [objWaste] = await retry(() => Objective.findOrCreate({ where: { title: 'Reducir desperdicio de alimentos' }, defaults: { title: 'Reducir desperdicio de alimentos', description: 'Optimizar compras y preparación para reducir el waste', perspective_id: perspectives[2].id, restaurant_id: salaman.id, owner_id: managerSal.id } }));

  // KPIs
  const [kpiRevenues] = await retry(() => Kpi.findOrCreate({ where: { name: 'Ingresos Mensuales', restaurant_id: salaman.id }, defaults: { name: 'Ingresos Mensuales', description: 'Ingresos totales por mes', formula: 'SUM(ventas)', frequency: 'monthly', unit: 'currency', current_value: 30000, target_value: 33000, alert_condition: 'below', alert_threshold: 0.95, owner_id: managerSal.id, objective_id: objSales.id, restaurant_id: salaman.id } }));
  const [kpiTicket] = await retry(() => Kpi.findOrCreate({ where: { name: 'Ticket Medio', restaurant_id: salaman.id }, defaults: { name: 'Ticket Medio', description: 'Promedio de ticket por cliente', formula: 'SUM(importe)/COUNT(tickets)', frequency: 'monthly', unit: 'currency', current_value: 20.5, target_value: 22.5, alert_condition: 'below', alert_threshold: 0.95, owner_id: managerSal.id, objective_id: objSales.id, restaurant_id: salaman.id } }));
  const [kpiNPS] = await retry(() => Kpi.findOrCreate({ where: { name: 'Satisfacción (NPS)' }, defaults: { name: 'Satisfacción (NPS)', description: 'Net Promoter Score', formula: 'Survey NPS', frequency: 'monthly', unit: 'number', current_value: 78, target_value: 85, alert_condition: 'below', alert_threshold: 0.95, owner_id: managerZam.id, objective_id: objSatisfaction.id, restaurant_id: null } }));
  const [kpiFoodCost] = await retry(() => Kpi.findOrCreate({ where: { name: 'Coste de Alimentos %', restaurant_id: salaman.id }, defaults: { name: 'Coste de Alimentos %', description: 'Food Cost % = Coste alimentos / Ventas', formula: 'CosteAlim/Ventas', frequency: 'monthly', unit: 'percent', current_value: 28, target_value: 25, alert_condition: 'above', alert_threshold: 1.05, owner_id: managerSal.id, objective_id: objWaste.id, restaurant_id: salaman.id } }));

  // KPI ENTRIES
  await retry(() => KpiEntry.findOrCreate({ where: { kpi_id: kpiRevenues.id, period_start: '2025-10-01' }, defaults: { kpi_id: kpiRevenues.id, recorded_by: managerSal.id, value: 29500, period_start: '2025-10-01', note: 'Octubre: promoción semanal' } }));
  await retry(() => KpiEntry.findOrCreate({ where: { kpi_id: kpiRevenues.id, period_start: '2025-11-01' }, defaults: { kpi_id: kpiRevenues.id, recorded_by: managerSal.id, value: 32000, period_start: '2025-11-01', note: 'Noviembre: inicio campaña' } }));
  await retry(() => KpiEntry.findOrCreate({ where: { kpi_id: kpiNPS.id, period_start: '2025-11-01' }, defaults: { kpi_id: kpiNPS.id, recorded_by: managerSal.id, value: 78, period_start: '2025-11-01', note: 'NPS encuesta digital' } }));

  // Tasks
  await retry(() => Task.findOrCreate({ where: { title: 'Campaña marketing noviembre' }, defaults: { title: 'Campaña marketing noviembre', description: 'Campaña para incrementar ventas en Salamanca', owner_id: managerSal.id, assigned_to: managerSal.id, objective_id: objSales.id, due_date: '2025-11-30', status: 'in-progress', priority: 'high' } }));
  await retry(() => Task.findOrCreate({ where: { title: 'Formación de atención al cliente' }, defaults: { title: 'Formación de atención al cliente', description: 'Entrenamiento en trato y experiencia', owner_id: managerSal.id, assigned_to: managerSal.id, objective_id: objSatisfaction.id, due_date: '2025-12-15', status: 'todo', priority: 'normal' } }));

  console.log('Seed finished.');
  console.log('Default seeded users: admin@claunafood.local, manager.salamanca@claunafood.local, manager.zamora@claunafood.local');
  console.log(`Default password: ${passwordPlain}`);
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = seed;
