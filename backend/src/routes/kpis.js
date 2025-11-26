const express = require('express');
const router = express.Router();
const { list, get, create, update, exportCsv } = require('../controllers/kpiController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, list);
router.get('/:id', requireAuth, get);
router.post('/', requireAuth, requireRole('admin'), create);
router.put('/:id', requireAuth, requireRole('admin'), update);
router.get('/export', requireAuth, exportCsv);

module.exports = router;
