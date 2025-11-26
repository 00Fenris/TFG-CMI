const { Kpi, KpiEntry, Restaurant, Objective, Perspective } = require('../models');

exports.restaurantSummary = async (req, res) => {
  const { restaurantId } = req.params;
  const kpis = await Kpi.findAll({ where: { restaurant_id: restaurantId }, include: [{ model: Objective, include: [Perspective] }] });
  const result = [];
  for (const k of kpis) {
    const entries = await KpiEntry.findAll({ where: { kpi_id: k.id }, order: [['period_start', 'ASC']] });
    result.push({ kpi: k, entries });
  }
  res.json(result);
};

exports.globalSummary = async (req, res) => {
  const restaurants = await Restaurant.findAll();
  const data = [];
  for (const r of restaurants) {
    const kpis = await Kpi.findAll({ where: { restaurant_id: r.id }, include: [{ model: Objective, include: [Perspective] }] });
    const kpisWithEntries = [];
    for (const k of kpis) {
      const entries = await KpiEntry.findAll({ where: { kpi_id: k.id }, order: [['period_start', 'ASC']] });
      kpisWithEntries.push({ kpi: k, entries });
    }
    data.push({ restaurant: r, kpis: kpisWithEntries });
  }
  res.json(data);
};
