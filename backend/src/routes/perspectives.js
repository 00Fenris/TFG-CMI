const express = require('express');
const router = express.Router();
const { list, create } = require('../controllers/perspectiveController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, list);
router.post('/', requireAuth, requireRole('admin'), create);

module.exports = router;
