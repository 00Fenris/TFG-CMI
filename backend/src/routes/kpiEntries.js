const express = require('express');
const router = express.Router();
const { listByKpi, create } = require('../controllers/kpiEntryController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/kpi/:kpiId', requireAuth, listByKpi);
router.post('/', requireAuth, create);

module.exports = router;
