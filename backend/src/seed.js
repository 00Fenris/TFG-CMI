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
    console.log('Force Syncing DB to wipe and recreate clean state...');
    await retry(() => sequelize.sync({ force: true }), 6, 200);
  } else {
    console.log('Using in-memory mock DB; skipping sync');
  }

  const passwordPlain = process.env.SEED_PASSWORD || 'password';
  const passwordHash = bcrypt.hashSync(passwordPlain, 10);

  // 1. Restaurants
  const [salaman, zamora, opening] = await Promise.all([
    retry(() => Restaurant.create({ name: 'Ditaly', city: 'Salamanca', address: 'Calle Feria 10', status: 'open' })),
    retry(() => Restaurant.create({ name: 'LaRuqa', city: 'Zamora', address: 'Calle Santa Clara 5', status: 'open' })),
    retry(() => Restaurant.create({ name: 'La Mafia', city: 'Salamanca', address: 'Plaza Mayor', status: 'opening' }))
  ]);

  // 2. Perspectives
  const perspectivesSeed = [
    { name: 'Financiera', description: 'Objetivos financieros: ingresos, costes, margen' },
    { name: 'Clientes', description: 'Satisfacción, fidelización, ticket medio' },
    { name: 'Procesos internos', description: 'Eficiencia operativa, tiempos, desperdicio' },
    { name: 'Aprendizaje y crecimiento', description: 'Formación del personal, rotación, clima laboral' }
  ];
  const perspectives = [];
  for (const p of perspectivesSeed) {
    const model = await retry(() => Perspective.create(p));
    perspectives.push(model);
  }

  // 3. Users
  const admin = await retry(() => User.create({ name: 'Admin Clauna', email: 'admin@claunafood.local', password_hash: passwordHash, role: 'admin' }));
  const managerSal = await retry(() => User.create({ name: 'Manager Salamanca', email: 'manager.salamanca@claunafood.local', password_hash: passwordHash, role: 'manager', restaurant_id: salaman.id }));
  const managerZam = await retry(() => User.create({ name: 'Manager Zamora', email: 'manager.zamora@claunafood.local', password_hash: passwordHash, role: 'manager', restaurant_id: zamora.id }));
  const managerRuqa = await retry(() => User.create({ name: 'Manager LaRuqa', email: 'manager.laruqa@claunafood.local', password_hash: passwordHash, role: 'manager', restaurant_id: opening.id }));

  // 4. Objectives
  const objLiquidity = await retry(() => Objective.create({ title: 'Optimizar Rentabilidad y Liquidez', description: 'Mantener control de costes estructurales y asegurar flujo de caja', perspective_id: perspectives[0].id, owner_id: admin.id }));
  const objSales = await retry(() => Objective.create({ title: 'Crecimiento de Ventas', description: 'Aumentar facturación y ticket medio', perspective_id: perspectives[0].id, owner_id: admin.id }));
  const objLoyalty = await retry(() => Objective.create({ title: 'Fidelización de Clientes Regulares', description: 'Incrementar la tasa de retorno', perspective_id: perspectives[1].id, owner_id: managerSal.id }));
  const objSatisfaction = await retry(() => Objective.create({ title: 'Mejora de Experiencia', description: 'Subir nota en TripAdvisor/Google', perspective_id: perspectives[1].id, owner_id: managerSal.id }));
  const objEfficiency = await retry(() => Objective.create({ title: 'Eficiencia Operativa en Cocina', description: 'Reducir tiempos muertos y mermas', perspective_id: perspectives[2].id, owner_id: managerSal.id }));
  const objTeam = await retry(() => Objective.create({ title: 'Retención y Capacitación de Plantilla', description: 'Reducir rotación no deseada', perspective_id: perspectives[3].id, owner_id: admin.id }));

  // 5. KPIs
  // Helper to create KPI for all 3 restaurants at once
  const createKpiForAll = async (kpiDef) => {
    const kpis = [];
    const restaurants = [salaman, zamora, opening];
    for (const r of restaurants) {
      // Add slight variance to target values so restaurants look real
      const variance = (Math.random() * 0.1) - 0.05; // -5% to +5%
      const target = Number(kpiDef.target_value);
      const randomTarget = target + (target * variance);

      const valVariance = (Math.random() * 0.2) - 0.1; // -10% to +10%
      const current = Number(kpiDef.current_value);
      const randomCurrent = current + (current * valVariance);

      const k = await retry(() => Kpi.create({
        ...kpiDef,
        restaurant_id: r.id,
        target_value: randomTarget.toFixed(2),
        current_value: randomCurrent.toFixed(2)
      }));
      kpis.push(k);
    }
    return kpis;
  };

  const kpisEbitda = await createKpiForAll({ name: 'EBITDA Margin', description: '% de beneficios operativos', formula: 'EBITDA/Revenues', frequency: 'monthly', unit: 'percent', current_value: 15.2, target_value: 18.0, alert_condition: 'below', alert_threshold: 0.90, owner_id: admin.id, objective_id: objLiquidity.id });
  const kpisRevenues = await createKpiForAll({ name: 'Facturación Mensual (€)', description: 'Ingresos netos por ventas', formula: 'Ventas - IVA', frequency: 'monthly', unit: 'currency', current_value: 45000, target_value: 48000, alert_condition: 'below', alert_threshold: 0.85, owner_id: admin.id, objective_id: objSales.id });
  const kpisFoodCost = await createKpiForAll({ name: 'Food Cost (%)', description: 'Coste de materia prima consumida', formula: 'Compras/Ventas', frequency: 'monthly', unit: 'percent', current_value: 32.5, target_value: 30.0, alert_condition: 'above', alert_threshold: 1.05, owner_id: managerSal.id, objective_id: objLiquidity.id });
  const kpisLaborCost = await createKpiForAll({ name: 'Labor Cost (%)', description: 'Coste de personal total', formula: 'Labor/Revenues', frequency: 'monthly', unit: 'percent', current_value: 32.5, target_value: 30.0, alert_condition: 'above', alert_threshold: 1.05, owner_id: managerSal.id, objective_id: objLiquidity.id });
  const kpisTicketMedia = await createKpiForAll({ name: 'Ticket Medio (€)', description: 'Gasto medio por comensal', formula: 'Ventas/Comensales', frequency: 'daily', unit: 'currency', current_value: 18.5, target_value: 20.0, alert_condition: 'below', alert_threshold: 0.90, owner_id: managerSal.id, objective_id: objSales.id });
  const kpisDelivery = await createKpiForAll({ name: 'Ventas Delivery (%)', description: 'Peso de Glovo/UberEats', formula: 'Delivery/Total', frequency: 'monthly', unit: 'percent', current_value: 18, target_value: 25, alert_condition: 'below', alert_threshold: 0.80, owner_id: managerSal.id, objective_id: objSales.id });
  const kpisTurnover = await createKpiForAll({ name: 'Rotación de Mesas', description: 'Servicios por mesa', formula: 'Comensales/Sillas', frequency: 'weekly', unit: 'number', current_value: 2.1, target_value: 2.5, alert_condition: 'below', alert_threshold: 0.90, owner_id: managerSal.id, objective_id: objEfficiency.id });
  const kpisPrepTime = await createKpiForAll({ name: 'Tiempo Preparación (min)', description: 'Minutos desde comanda a pase', formula: 'Avg(PrepTime)', frequency: 'daily', unit: 'number', current_value: 14.5, target_value: 12.0, alert_condition: 'above', alert_threshold: 1.10, owner_id: managerSal.id, objective_id: objEfficiency.id });
  const kpisStaffTurnover = await createKpiForAll({ name: 'Rotación Plantilla (%)', description: 'Bajas sobre plantilla media', formula: 'Bajas/Plantilla', frequency: 'monthly', unit: 'percent', current_value: 22.5, target_value: 15.0, alert_condition: 'above', alert_threshold: 1.20, owner_id: admin.id, objective_id: objTeam.id });
  const kpisNPS = await createKpiForAll({ name: 'NPS Global', description: 'Net Promoter Score de clientes', formula: 'Promotores - Detractores', frequency: 'weekly', unit: 'number', current_value: 65, target_value: 75, alert_condition: 'below', alert_threshold: 0.90, owner_id: managerSal.id, objective_id: objSatisfaction.id });

  // 6. Generate Historical Data
  const generateHistory = async (kpiIds, baseValue, isPercent, isUpTrend) => {
    for (const k of kpiIds) {
      const d = new Date('2025-06-01');
      for (let i = 0; i < 6; i++) {
        // Vary randomly for each entry so graphs look real
        const localVariance = (Math.random() * 0.15) - 0.05;
        const factor = isUpTrend ? (1 + (i * 0.05)) : (1 - (i * 0.03));
        let val = Number(baseValue) * factor * (1 + localVariance);
        if (isPercent) val = Math.min(100, Math.max(0, val));

        await retry(() => KpiEntry.create({
          kpi_id: k.id,
          recorded_by: k.owner_id,
          value: val.toFixed(2),
          period_start: d.toISOString().split('T')[0]
        }));
        d.setMonth(d.getMonth() + 1);
      }
    }
  };

  await generateHistory(kpisEbitda, 14, true, true);
  await generateHistory(kpisRevenues, 38000, false, true);
  await generateHistory(kpisFoodCost, 35, true, false);
  await generateHistory(kpisLaborCost, 36, true, false);
  await generateHistory(kpisTicketMedia, 16.5, false, true);
  await generateHistory(kpisDelivery, 15, true, true);
  await generateHistory(kpisTurnover, 1.8, false, true);
  await generateHistory(kpisPrepTime, 18, false, false);
  await generateHistory(kpisStaffTurnover, 25, true, false);
  await generateHistory(kpisNPS, 55, false, true);


  // Tasks
  await retry(() => Task.findOrCreate({ where: { title: 'Campaña marketing noviembre' }, defaults: { title: 'Campaña marketing noviembre', description: 'Campaña para incrementar ventas en Salamanca', owner_id: managerSal.id, assigned_to: managerSal.id, objective_id: objSales.id, due_date: '2025-11-30', status: 'in-progress', priority: 'high' } }));

  console.log('Seed finished successfully (Fully populated DB).');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = seed;
