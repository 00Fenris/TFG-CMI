const express = require('express');
const router = express.Router();
const { list, get, create, update } = require('../controllers/objectiveController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, list);
router.get('/:id', requireAuth, get);
router.post('/', requireAuth, requireRole('admin'), create);
router.put('/:id', requireAuth, requireRole('admin'), update);

module.exports = router;
