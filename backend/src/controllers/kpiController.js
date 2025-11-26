const { Kpi, KpiEntry, User } = require('../models');

exports.list = async (req, res) => {
  const where = {};
  if (req.query.restaurant_id) where.restaurant_id = req.query.restaurant_id;
  if (req.query.objective_id) where.objective_id = req.query.objective_id;
  const kpis = await Kpi.findAll({ where, include: [{ model: User, as: 'owner' }] });
  res.json(kpis);
};

exports.get = async (req, res) => {
  const kpi = await Kpi.findByPk(req.params.id, { include: [KpiEntry] });
  if (!kpi) return res.status(404).json({ message: 'Not found' });
  res.json(kpi);
};

exports.create = async (req, res) => {
  try {
    const newKpi = await Kpi.create(req.body);
    res.status(201).json(newKpi);
  } catch (err) {
    res.status(400).json({ message: 'create error', error: err.message });
  }
};

exports.update = async (req, res) => {
  const kpi = await Kpi.findByPk(req.params.id);
  if (!kpi) return res.status(404).json({ message: 'Not found' });
  try {
    await kpi.update(req.body);
    res.json(kpi);
  } catch (err) {
    res.status(400).json({ message: 'update error', error: err.message });
  }
};

// Export KPIs and their entries as CSV (simple format)
exports.exportCsv = async (req, res) => {
  const { restaurant_id } = req.query;
  const where = {};
  if (restaurant_id) where.restaurant_id = restaurant_id;
  const kpis = await Kpi.findAll({ where });
  let csv = 'kpi_id,kpi_name,entry_date,value,note\n';
  for (const k of kpis) {
    const entries = await KpiEntry.findAll({ where: { kpi_id: k.id }, order: [['period_start', 'ASC']] });
    if (entries.length === 0) csv += `${k.id},"${k.name}",,,\n`;
    for (const e of entries) {
      csv += `${k.id},"${k.name}",${e.period_start},${e.value},"${(e.note || '').replace(/"/g, '""')}"\n`;
    }
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="kpis_export_${restaurant_id || 'all'}.csv"`);
  res.send(csv);
};
