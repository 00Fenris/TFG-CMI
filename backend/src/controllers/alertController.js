const { KpiAlert, Kpi, Restaurant, Objective, Perspective } = require('../models');

/**
 * Generate automatic alerts based on KPI performance
 */
const generateAutomaticAlerts = async () => {
  const kpis = await Kpi.findAll({ include: [{ model: Restaurant }, { model: Objective }] });
  const alerts = [];

  for (const kpi of kpis) {
    const current = Number(kpi.current_value || 0);
    const target = Number(kpi.target_value || 1);
    const ratio = current / target;
    const threshold = Number(kpi.alert_threshold || 1);

    let shouldAlert = false;
    let message = '';
    let severity = 'warning';

    if (kpi.alert_condition === 'below') {
      // Alert if ratio is below threshold (e.g., revenues below 95% of target)
      if (ratio <= threshold) {
        shouldAlert = true;
        const pctDiff = Math.round((1 - ratio) * 100);
        message = `${kpi.name} está ${pctDiff}% por debajo del objetivo`;
        severity = ratio < threshold * 0.9 ? 'critical' : 'warning';
      }
    } else if (kpi.alert_condition === 'above') {
      // Alert if ratio is above threshold (e.g., costs above 105% of target)
      if (ratio >= threshold) {
        shouldAlert = true;
        const pctDiff = Math.round((ratio - 1) * 100);
        message = `${kpi.name} está ${pctDiff}% por encima del objetivo`;
        severity = ratio > threshold * 1.1 ? 'critical' : 'warning';
      }
    }

    if (shouldAlert) {
      alerts.push({
        kpi_id: kpi.id,
        kpi: kpi,
        restaurant: kpi.Restaurant,
        message,
        severity,
        current_value: current,
        recorded_value: current,
        target_value: target,
        ratio: Math.round(ratio * 100),
        created_at: new Date()
      });
    }
  }

  return alerts;
};

/**
 * List all alerts (both stored and dynamically generated)
 */
exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.kpi_id) where.kpi_id = req.query.kpi_id;
    if (req.query.restaurant_id) {
      // Filter by restaurant through KPI
      const kpis = await Kpi.findAll({ where: { restaurant_id: req.query.restaurant_id } });
      where.kpi_id = kpis.map(k => k.id);
    }

    // Get stored alerts
    const storedAlerts = await KpiAlert.findAll({
      where,
      include: [Kpi],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    // Generate dynamic alerts based on current KPI status
    const dynamicAlerts = await generateAutomaticAlerts();

    // Filter dynamic alerts if restaurant filter is applied
    let filteredDynamicAlerts = dynamicAlerts;
    if (req.query.restaurant_id) {
      filteredDynamicAlerts = dynamicAlerts.filter(a =>
        a.restaurant && a.restaurant.id === parseInt(req.query.restaurant_id)
      );
    }

    // Combine and prioritize critical alerts
    const allAlerts = [
      ...filteredDynamicAlerts.filter(a => a.severity === 'critical'),
      ...filteredDynamicAlerts.filter(a => a.severity === 'warning'),
      ...storedAlerts.map(a => ({
        id: a.id,
        kpi_id: a.kpi_id,
        kpi: a.Kpi,
        message: a.message || a.condition,
        severity: 'stored',
        recorded_value: a.recorded_value,
        target_value: a.target_value,
        created_at: a.created_at
      }))
    ];

    res.json(allAlerts);
  } catch (err) {
    console.error('Alert list error:', err);
    res.status(500).json({ message: 'Error fetching alerts', error: err.message });
  }
};

/**
 * Get alert summary statistics
 */
exports.summary = async (req, res) => {
  try {
    const dynamicAlerts = await generateAutomaticAlerts();

    const summary = {
      total: dynamicAlerts.length,
      critical: dynamicAlerts.filter(a => a.severity === 'critical').length,
      warning: dynamicAlerts.filter(a => a.severity === 'warning').length,
      byRestaurant: {}
    };

    dynamicAlerts.forEach(alert => {
      const restName = alert.restaurant?.name || 'Global';
      if (!summary.byRestaurant[restName]) {
        summary.byRestaurant[restName] = { critical: 0, warning: 0 };
      }
      summary.byRestaurant[restName][alert.severity]++;
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching alert summary', error: err.message });
  }
};

/**
 * Acknowledge/dismiss an alert
 */
exports.acknowledge = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await KpiAlert.findByPk(id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    await alert.update({ acknowledged: true, acknowledged_at: new Date() });
    res.json({ message: 'Alert acknowledged', alert });
  } catch (err) {
    res.status(500).json({ message: 'Error acknowledging alert', error: err.message });
  }
};
