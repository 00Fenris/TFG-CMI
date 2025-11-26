const { KpiAlert, Kpi } = require('../models');

exports.list = async (req, res) => {
  const where = {};
  if (req.query.kpi_id) where.kpi_id = req.query.kpi_id;
  const alerts = await KpiAlert.findAll({ where, include: [Kpi], order: [['created_at', 'DESC']], limit: 100 });
  res.json(alerts);
};
