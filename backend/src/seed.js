require('dotenv').config();
const bcrypt = require('bcryptjs');
const modelsIndex = require('./models');
const { sequelize, usingSequelize, User, Restaurant, Perspective, Objective, Kpi, KpiEntry, Task } = modelsIndex;

async function seed() {
  async function retry(fn, attempts = 50, delay = 3000) {
    for (let i = 0; i < attempts; i++) {
      try { return await fn(); } catch (err) {
        if (i === attempts - 1) throw err;
        console.warn(`Retrying after error (${i+1}/${attempts}):`, err && err.message);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  if (usingSequelize && sequelize) {
    console.log('Syncing DB (force=true to clear old structure)...');
    await retry(() => sequelize.sync({ force: true }));
  } else {
    console.log('Using in-memory mock DB; skipping sync');
  }

  const passwordPlain = process.env.SEED_PASSWORD || 'password';
  const passwordHash = bcrypt.hashSync(passwordPlain, 10);

  // ==========================================
  // RESTAURANTES (Nombres esperados por el Frontend)
  // ==========================================
  const [salaman, zamora, opening] = await Promise.all([
    retry(() => Restaurant.findOrCreate({ where: { name: 'Ditaly (Salamanca)' }, defaults: { city: 'Salamanca', address: 'Calle Feria 10', status: 'open' } })),
    retry(() => Restaurant.findOrCreate({ where: { name: 'La Mafia (Zamora)' }, defaults: { city: 'Zamora', address: 'Calle Santa Clara 5', status: 'open' } })),
    retry(() => Restaurant.findOrCreate({ where: { name: 'LaRuqa (Siglo XXI - Zamora)' }, defaults: { city: 'Zamora', address: 'TBD', status: 'opening' } }))
  ]).then(rows => rows.map(r => Array.isArray(r) ? r[0] : r));

  // ==========================================
  // 4 PERSPECTIVAS DEL CMI
  // ==========================================
  const perspectivesSeed = [
    { name: 'Financiera', description: 'Vectores críticos de rentabilidad: EBITDA, Prime Cost y RevPASH' },
    { name: 'Clientes', description: 'Lealtad, NPS y valoración del mercado externo' },
    { name: 'Procesos Internos', description: 'Velocidad de flujo, rotación y optimización de mermas' },
    { name: 'Aprendizaje y Crecimiento', description: 'Clima laboral, formación y retención de talento' }
  ];
  const perspectives = [];
  for (const p of perspectivesSeed) {
    const model = await retry(() => Perspective.create(p));
    perspectives.push(model);
  }
  const [pFinanciera, pClientes, pProcesos, pAprendizaje] = perspectives;

  // ==========================================
  // USUARIOS
  // ==========================================
  const [admin] = await retry(() => User.findOrCreate({ 
    where: { email: 'admin@claunafood.local' }, 
    defaults: { name: 'Administrador General', email: 'admin@claunafood.local', password_hash: passwordHash, role: 'admin' } 
  }));
  const [managerSal] = await retry(() => User.findOrCreate({ 
    where: { email: 'manager.salamanca@claunafood.local' }, 
    defaults: { name: 'María García (Salamanca)', email: 'manager.salamanca@claunafood.local', password_hash: passwordHash, role: 'manager', restaurant_id: salaman.id } 
  }));
  const [managerZam] = await retry(() => User.findOrCreate({ 
    where: { email: 'manager.zamora@claunafood.local' }, 
    defaults: { name: 'Carlos López (Zamora)', email: 'manager.zamora@claunafood.local', password_hash: passwordHash, role: 'manager', restaurant_id: zamora.id } 
  }));

  // ==========================================
  // OBJETIVOS ESTRATÉGICOS (Mapeados del TFG Capítulo 4)
  // ==========================================
  
  // Aprendizaje (Base)
  const [objA1] = await retry(() => Objective.findOrCreate({ where: { title: 'Plan de Formación Interna' }, defaults: { title: 'Plan de Formación Interna', description: 'Asegurar capacitación', perspective_id: pAprendizaje.id, owner_id: admin.id } }));
  const [objA2] = await retry(() => Objective.findOrCreate({ where: { title: 'Reducción de Rotación de Personal' }, defaults: { title: 'Reducción de Rotación de Personal', description: 'Retener el talento clave', perspective_id: pAprendizaje.id, owner_id: admin.id } }));
  const [objA3] = await retry(() => Objective.findOrCreate({ where: { title: 'Mejora del eNPS del Equipo' }, defaults: { title: 'Mejora del eNPS del Equipo', description: 'Fomentar el clima laboral', perspective_id: pAprendizaje.id, owner_id: admin.id } }));
  
  // Procesos
  const [objP1] = await retry(() => Objective.findOrCreate({ where: { title: 'Reducción de Mermas en Cocina' }, defaults: { title: 'Reducción de Mermas en Cocina', description: 'Minimizar desviaciones de escandallo', perspective_id: pProcesos.id, owner_id: admin.id } }));
  const [objP2] = await retry(() => Objective.findOrCreate({ where: { title: 'Reducción del Lead Time de Servicio' }, defaults: { title: 'Reducción del Lead Time de Servicio', description: 'Acelerar operativa en picos', perspective_id: pProcesos.id, owner_id: admin.id } }));
  const [objP3] = await retry(() => Objective.findOrCreate({ where: { title: 'Optimización de la Rotación de Mesas' }, defaults: { title: 'Optimización de la Rotación de Mesas', description: 'Maximizar flujo de la sala', perspective_id: pProcesos.id, owner_id: admin.id } }));

  // Clientes
  const [objC1] = await retry(() => Objective.findOrCreate({ where: { title: 'NPS > 50' }, defaults: { title: 'NPS > 50', description: 'Lograr NPS Global superior a 50', perspective_id: pClientes.id, owner_id: admin.id } }));
  const [objC2] = await retry(() => Objective.findOrCreate({ where: { title: 'Reducir Incidencias y Mejorar Delivery' }, defaults: { title: 'Reducir Incidencias y Mejorar Delivery', description: 'Control de quejas y expansión de canal de reparto', perspective_id: pClientes.id, owner_id: admin.id } }));

  // Financiera
  const [objF1] = await retry(() => Objective.findOrCreate({ where: { title: 'Control Prime Costs < 62%' }, defaults: { title: 'Control Prime Costs < 62%', description: 'Blindar suma salarial y materia prima', perspective_id: pFinanciera.id, owner_id: admin.id } }));
  const [objF3] = await retry(() => Objective.findOrCreate({ where: { title: 'Mejora del RevPASH Diario' }, defaults: { title: 'Mejora del RevPASH Diario', description: 'Aumentar ingresos por asiento y hora', perspective_id: pFinanciera.id, owner_id: admin.id } }));
  const [objF4] = await retry(() => Objective.findOrCreate({ where: { title: 'Crecimiento del Margen EBITDA' }, defaults: { title: 'Crecimiento del Margen EBITDA', description: 'Consolidar beneficio neto operativo', perspective_id: pFinanciera.id, owner_id: admin.id } }));

  // ==========================================
  // 12 KPIs EXACTOS DEL TFG POR RESTAURANTE
  // ==========================================
  const createKpisForRestaurant = async (rest, managerId) => {
    const isZamora = rest.name.includes('Zamora');
    
    // 1. Tasa de Rotación (Aprendizaje) - Salamanca empieza en 22.5% (Tabla 3.1)
    const kpi1 = await retry(() => Kpi.create({ name: 'Tasa de Rotación', description: '(Bajas/Plantilla Media)*100', formula: 'bajas/plantilla*100', frequency: 'monthly', unit: 'percent', current_value: isZamora ? 14.0 : 22.5, target_value: 15.0, alert_condition: 'above', alert_threshold: 1.1, owner_id: managerId, objective_id: objA2.id, restaurant_id: rest.id }));
    
    // 2. Índice de Formación (Aprendizaje)
    const kpi2 = await retry(() => Kpi.create({ name: 'Índice de Formación', description: 'Personal con formación al día', formula: 'formados/total*100', frequency: 'quarterly', unit: 'percent', current_value: isZamora ? 95.0 : 85.0, target_value: 100.0, alert_condition: 'below', alert_threshold: 0.85, owner_id: managerId, objective_id: objA1.id, restaurant_id: rest.id }));
    
    // 3. eNPS (Aprendizaje)
    const kpi3 = await retry(() => Kpi.create({ name: 'eNPS', description: 'Employee Net Promoter Score', formula: 'Encuesta interna 1-10', frequency: 'monthly', unit: 'number', current_value: isZamora ? 72.0 : 64.0, target_value: 70.0, alert_condition: 'below', alert_threshold: 0.90, owner_id: managerId, objective_id: objA3.id, restaurant_id: rest.id }));
    
    // 4. Rotación de Mesas (Procesos)
    const kpi4 = await retry(() => Kpi.create({ name: 'Rotación de Mesas', description: 'Tickets / Número de mesas', formula: 'tickets/mesas', frequency: 'weekly', unit: 'number', current_value: isZamora ? 2.8 : 2.2, target_value: 2.5, alert_condition: 'below', alert_threshold: 0.90, owner_id: managerId, objective_id: objP3.id, restaurant_id: rest.id }));
    
    // 5. Lead Time de Cocina (Procesos)
    const kpi5 = await retry(() => Kpi.create({ name: 'Lead Time de Cocina', description: 'Minutos desde TPV a plato servido', formula: 'AVG(tiempo)', frequency: 'weekly', unit: 'number', current_value: isZamora ? 14.0 : 18.0, target_value: 15.0, alert_condition: 'above', alert_threshold: 1.15, owner_id: managerId, objective_id: objP2.id, restaurant_id: rest.id }));
    
    // 6. Desviación Escandallo (Procesos)
    const kpi6 = await retry(() => Kpi.create({ name: 'Desviación Escandallo', description: 'Merma sobre coste teórico', formula: '(real-teorico)/teorico', frequency: 'monthly', unit: 'percent', current_value: isZamora ? 1.5 : 3.5, target_value: 2.0, alert_condition: 'above', alert_threshold: 1.25, owner_id: managerId, objective_id: objP1.id, restaurant_id: rest.id }));

    // 7. NPS Global (Cliente) - Salamanca empieza en 65 (Tabla 3.1)
    const kpi7 = await retry(() => Kpi.create({ name: 'NPS Global', description: '% Promotores - % Detractores', formula: 'promotores-detractores', frequency: 'monthly', unit: 'number', current_value: isZamora ? 68.0 : 65.0, target_value: 75.0, alert_condition: 'below', alert_threshold: 0.90, owner_id: managerId, objective_id: objC1.id, restaurant_id: rest.id }));
    
    // 8. % Ventas Delivery (Cliente)
    const kpi8 = await retry(() => Kpi.create({ name: '% Ventas Delivery', description: 'Ingresos delivery / Totales', formula: 'delivery/total*100', frequency: 'monthly', unit: 'percent', current_value: isZamora ? 25.0 : 18.0, target_value: 20.0, alert_condition: 'below', alert_threshold: 0.85, owner_id: managerId, objective_id: objC2.id, restaurant_id: rest.id }));
    
    // 9. Tasa de Incidencias (Cliente)
    const kpi9 = await retry(() => Kpi.create({ name: 'Tasa de Incidencias', description: 'Quejas / Total tickets', formula: 'quejas/tickets*100', frequency: 'monthly', unit: 'percent', current_value: isZamora ? 0.8 : 1.5, target_value: 1.0, alert_condition: 'above', alert_threshold: 1.20, owner_id: managerId, objective_id: objC2.id, restaurant_id: rest.id }));

    // 10. EBITDA Margin (Financiera) - Salamanca empieza en 15.0% (Tabla 3.1)
    const kpi10 = await retry(() => Kpi.create({ name: 'EBITDA Margin', description: 'Beneficio neto / Ventas', formula: 'ebitda/ventas*100', frequency: 'monthly', unit: 'percent', current_value: isZamora ? 19.5 : 15.0, target_value: 18.0, alert_condition: 'below', alert_threshold: 0.90, owner_id: managerId, objective_id: objF4.id, restaurant_id: rest.id }));
    
    // 11. Prime Cost (Financiera) - Salamanca empieza en 65.0% (Tabla 3.1)
    const kpi11 = await retry(() => Kpi.create({ name: 'Prime Cost (F&B + Labor)', description: 'Coste directo operativo', formula: 'food_cost+labor_cost', frequency: 'monthly', unit: 'percent', current_value: isZamora ? 59.5 : 65.0, target_value: 62.0, alert_condition: 'above', alert_threshold: 1.05, owner_id: managerId, objective_id: objF1.id, restaurant_id: rest.id }));
    
    // 12. RevPASH (Financiera)
    const kpi12 = await retry(() => Kpi.create({ name: 'RevPASH', description: 'Ingresos por asiento disponible/hora', formula: 'ingresos/(asientos*horas)', frequency: 'weekly', unit: 'currency', current_value: isZamora ? 16.5 : 13.8, target_value: 15.0, alert_condition: 'below', alert_threshold: 0.90, owner_id: managerId, objective_id: objF3.id, restaurant_id: rest.id }));

    return [kpi1, kpi2, kpi3, kpi4, kpi5, kpi6, kpi7, kpi8, kpi9, kpi10, kpi11, kpi12];
  };

  const kpisSal = await createKpisForRestaurant(salaman, managerSal.id);
  const kpisZam = await createKpisForRestaurant(zamora, managerZam.id);

  // ==========================================
  // KPI ENTRIES (HISTÓRICO DINÁMICO HASTA EL DÍA DE HOY)
  // ==========================================
  const start = new Date(2024, 6, 1); // Julio 2024
  const end = new Date(); // Fecha actual (Mayo 2026)
  const months = [];
  let current = new Date(start);
  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}-${mm}-01`);
    current.setMonth(current.getMonth() + 1);
  }
  
  // Función para poblar un KPI con una tendencia que parte exactamente del valor inicial
  const seedKpiHistory = async (kpi, managerId, baseTrend) => {
    let finalValue = kpi.current_value;
    for (let i = 0; i < months.length; i++) {
      // Simula mejora progresiva partiendo del valor actual con una pequeña fluctuación aleatoria para realismo
      let fluctuation = (Math.random() - 0.5) * 1.2; 
      let val = Number(kpi.current_value) + (baseTrend * i) + fluctuation;
      if (kpi.unit === 'percent' && val > 100) val = 100;
      if (val < 0) val = 0;
      
      const finalValNum = Number(val.toFixed(2));
      if (i === months.length - 1) {
        finalValue = finalValNum;
      }
      
      await retry(() => KpiEntry.create({ 
        kpi_id: kpi.id, 
        recorded_by: managerId, 
        value: finalValNum, 
        period_start: months[i] 
      }));
    }
    // Actualizamos el valor actual del KPI al último valor histórico generado
    await retry(() => kpi.update({ current_value: finalValue }));
  };

  // Poblar históricos de los 24 KPIs
  for (const kpi of kpisSal) {
    // Salamanca mejora progresivamente (los costes bajan, los márgenes/satisfacción suben)
    const trend = kpi.alert_condition === 'above' ? -0.5 : 0.5;
    await seedKpiHistory(kpi, managerSal.id, trend);
  }
  for (const kpi of kpisZam) {
    // Zamora mejora a un ritmo menor ya que parte de una mejor posición
    const trend = kpi.alert_condition === 'above' ? -0.3 : 0.3;
    await seedKpiHistory(kpi, managerZam.id, trend);
  }

  // ==========================================
  // TAREAS (ACCIONES DE MEJORA - CAME)
  // ==========================================
  await retry(() => Task.create({ title: 'Revisar escandallos de pizzas premium', description: 'Ajustar receta por exceso de mermas', owner_id: managerSal.id, assigned_to: managerSal.id, objective_id: objP1.id, due_date: '2024-09-15', status: 'in-progress', priority: 'high' }));
  await retry(() => Task.create({ title: 'Nueva campaña en UberEats', description: 'Incrementar % Ventas Delivery', owner_id: admin.id, assigned_to: managerZam.id, objective_id: objC2.id, due_date: '2024-10-31', status: 'todo', priority: 'normal' }));
  await retry(() => Task.create({ title: 'Encuesta anónima trimestral (eNPS)', description: 'Enviar formularios QR al personal', owner_id: managerZam.id, assigned_to: managerZam.id, objective_id: objA3.id, due_date: '2024-11-20', status: 'in-progress', priority: 'high' }));
  await retry(() => Task.create({ title: 'Reestructurar turnos viernes noche', description: 'Para mejorar el Prime Cost por debajo del 62%', owner_id: admin.id, assigned_to: managerSal.id, objective_id: objF1.id, due_date: '2024-12-15', status: 'todo', priority: 'normal' }));

  console.log('✅ Seed (V2 TFG Alineado) finished successfully!');
  console.log('');
  console.log('📊 Datos creados:');
  console.log('   - 3 Restaurantes (Salamanca, Zamora, Nuevo Local)');
  console.log('   - 11 Objetivos Estratégicos (Mapeados Cap 4)');
  console.log('   - 24 KPIs (Los 12 exactos del TFG por local operativo)');
  console.log(`   - Histórico dinámico (${months.length} meses, de Julio 2024 a Hoy)`);
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = seed;
