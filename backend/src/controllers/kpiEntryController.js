const { KpiEntry, Kpi, KpiAlert } = require('../models');

exports.listByKpi = async (req, res) => {
  const kpiId = req.params.kpiId;
  const entries = await KpiEntry.findAll({ where: { kpi_id: kpiId }, order: [['period_start', 'ASC']] });
  res.json(entries);
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    if (!data.kpi_id || !data.value || !data.period_start) return res.status(400).json({ message: 'kpi_id, value and period_start are required' });
    const entry = await KpiEntry.create({ ...data, recorded_by: req.user.id });
    // Update KPI current_value
    const kpi = await Kpi.findByPk(data.kpi_id);
    if (kpi) {
      await kpi.update({ current_value: data.value });
      // Evaluate alert
      let triggers = false;
      if (kpi.alert_condition === 'below') {
        if (data.value < kpi.target_value * (kpi.alert_threshold || 1)) triggers = true;
      } else if (kpi.alert_condition === 'above') {
        if (data.value > kpi.target_value * (kpi.alert_threshold || 1)) triggers = true;
      }
      if (triggers) {
        await KpiAlert.create({ kpi_id: kpi.id, recorded_value: data.value, target_value: kpi.target_value, threshold: kpi.alert_threshold, condition: kpi.alert_condition });
      }
    }
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'create error', error: err.message });
  }
};
